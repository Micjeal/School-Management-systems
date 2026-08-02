-- Insert journal lines while the entry is draft, then post the completed balanced entry.
create or replace function public.post_manual_journal(
  target_school_id uuid,
  journal_data jsonb,
  lines jsonb
)
returns public.journal_entries
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_entry public.journal_entries;
  v_line jsonb;
  v_debits numeric;
  v_credits numeric;
begin
  if not private.has_permission(target_school_id,'finance.adjust') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if jsonb_typeof(lines) <> 'array' or jsonb_array_length(lines) < 2 then
    raise exception 'A journal requires at least two lines';
  end if;

  select
    coalesce(sum(coalesce((value->>'debit_amount')::numeric,0)),0),
    coalesce(sum(coalesce((value->>'credit_amount')::numeric,0)),0)
  into v_debits,v_credits
  from jsonb_array_elements(lines);

  if v_debits <= 0 or v_debits <> v_credits then
    raise exception 'Journal must be balanced and greater than zero';
  end if;

  insert into public.journal_entries(
    school_id,entry_number,entry_date,source_type,description,status,currency_code
  ) values (
    target_school_id,
    journal_data->>'entry_number',
    coalesce(nullif(journal_data->>'entry_date','')::date,current_date),
    'manual',
    journal_data->>'description',
    'draft',
    coalesce(nullif(journal_data->>'currency_code',''),'UGX')::char(3)
  ) returning * into v_entry;

  for v_line in select value from jsonb_array_elements(lines) loop
    if coalesce((v_line->>'debit_amount')::numeric,0) > 0
       and coalesce((v_line->>'credit_amount')::numeric,0) > 0 then
      raise exception 'A journal line cannot contain both a debit and credit';
    end if;
    if coalesce((v_line->>'debit_amount')::numeric,0) = 0
       and coalesce((v_line->>'credit_amount')::numeric,0) = 0 then
      raise exception 'A journal line must contain a debit or credit';
    end if;

    insert into public.journal_lines(
      school_id,journal_entry_id,account_id,student_id,description,debit_amount,credit_amount
    ) values (
      target_school_id,v_entry.id,(v_line->>'account_id')::uuid,
      nullif(v_line->>'student_id','')::uuid,nullif(v_line->>'description',''),
      coalesce((v_line->>'debit_amount')::numeric,0),
      coalesce((v_line->>'credit_amount')::numeric,0)
    );
  end loop;

  update public.journal_entries
  set status='posted', posted_at=now(), posted_by=auth.uid(), updated_at=now()
  where id=v_entry.id
  returning * into v_entry;

  return v_entry;
end;
$$;

revoke all on function public.post_manual_journal(uuid,jsonb,jsonb) from public, anon;
grant execute on function public.post_manual_journal(uuid,jsonb,jsonb) to authenticated, service_role;
