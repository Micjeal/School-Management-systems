-- Expand the school-creation workflow.
-- Replaces the old five-argument RPC with one unique ten-argument RPC.

drop function if exists public.create_school(
  text,
  text,
  text,
  text,
  text
);

create function public.create_school(
  school_name text,
  school_slug text,
  school_code text default null,
  school_email text default null,
  school_phone text default null,
  school_address text default null,
  country_code text default 'UG',
  timezone text default 'Africa/Kampala',
  currency_code text default 'UGX',
  main_campus_name text default 'Main Campus'
)
returns uuid
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_school_id uuid;
  v_campus_id uuid;
  v_user_id uuid := auth.uid();
  v_membership_id uuid;
  v_owner_role_id uuid;
  v_country_code text;
  v_currency_code text;
  v_timezone text;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not private.is_platform_admin() then
    raise exception 'Platform administrator access required'
      using errcode = '42501';
  end if;

  if coalesce(trim(school_name), '') = '' then
    raise exception 'School name is required';
  end if;

  if coalesce(trim(school_slug), '') = '' then
    raise exception 'School slug is required';
  end if;

  v_country_code :=
    upper(coalesce(nullif(trim(country_code), ''), 'UG'));

  v_currency_code :=
    upper(coalesce(nullif(trim(currency_code), ''), 'UGX'));

  v_timezone :=
    coalesce(nullif(trim(timezone), ''), 'Africa/Kampala');

  if length(v_country_code) <> 2 then
    raise exception 'Country code must contain exactly 2 characters';
  end if;

  if length(v_currency_code) <> 3 then
    raise exception 'Currency code must contain exactly 3 characters';
  end if;

  -- Use the existing global role because its permissions
  -- are already connected through role_permissions.
  select r.id
  into v_owner_role_id
  from public.roles r
  where r.school_id is null
    and r.code = 'school_owner'
    and r.is_active = true
  limit 1;

  if v_owner_role_id is null then
    raise exception 'The global school_owner role is missing';
  end if;

  insert into public.schools (
    name,
    slug,
    code,
    email,
    phone,
    country_code,
    timezone,
    currency_code,
    status,
    subscription_status,
    metadata,
    created_by
  )
  values (
    trim(school_name),
    lower(trim(school_slug)),
    nullif(trim(school_code), ''),
    nullif(lower(trim(school_email)), ''),
    nullif(trim(school_phone), ''),
    v_country_code::char(2),
    v_timezone,
    v_currency_code::char(3),
    'active',
    'trial',
    jsonb_strip_nulls(
      jsonb_build_object(
        'address',
        nullif(trim(school_address), '')
      )
    ),
    v_user_id
  )
  returning id into v_school_id;

  insert into public.school_settings (
    school_id
  )
  values (
    v_school_id
  );

  insert into public.campuses (
    school_id,
    name,
    code,
    email,
    phone,
    address_line1,
    country_code,
    is_main,
    is_active
  )
  values (
    v_school_id,
    coalesce(
      nullif(trim(main_campus_name), ''),
      'Main Campus'
    ),
    'MAIN',
    nullif(lower(trim(school_email)), ''),
    nullif(trim(school_phone), ''),
    nullif(trim(school_address), ''),
    v_country_code::char(2),
    true,
    true
  )
  returning id into v_campus_id;

  insert into public.school_memberships (
    school_id,
    campus_id,
    user_id,
    status,
    invited_by
  )
  values (
    v_school_id,
    v_campus_id,
    v_user_id,
    'active',
    v_user_id
  )
  returning id into v_membership_id;

  insert into public.membership_roles (
    membership_id,
    role_id,
    assigned_by
  )
  values (
    v_membership_id,
    v_owner_role_id,
    v_user_id
  );

  -- Use the existing tested finance initializer.
  perform public.initialize_school_finance(v_school_id);

  -- Record the school-creation event.
  insert into public.outbox_events (
    school_id,
    aggregate_type,
    aggregate_id,
    event_type,
    payload
  )
  values (
    v_school_id,
    'school',
    v_school_id,
    'school.created',
    jsonb_build_object(
      'school_id', v_school_id,
      'school_name', trim(school_name),
      'school_slug', lower(trim(school_slug)),
      'main_campus_id', v_campus_id,
      'created_by', v_user_id
    )
  );

  return v_school_id;
end;
$$;

revoke all on function public.create_school(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) from public, anon;

grant execute on function public.create_school(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated, service_role;

-- Refresh the Supabase Data API schema cache.
notify pgrst, 'reload schema';