-- SchoolDB files public download wrapper RPC
-- Creates a public wrapper for private file authorization helpers
-- This allows the Next.js server to safely call authorization checks

begin;

-- Public wrapper for private file download authorization
-- This function validates the source type and calls the appropriate private helper
-- Returns authorization result and safe metadata (never service keys or signing secrets)
create or replace function public.can_download_private_file(
  p_source_type text,
  p_source_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
declare
  v_allowed boolean;
  v_bucket text;
  v_path text;
  v_file_name text;
  v_mime_type text;
  v_school_id uuid;
  v_school_name text;
begin
  -- Validate source type allowlist
  if p_source_type not in ('person_document', 'report_card', 'payment_receipt', 'message_attachment') then
    return jsonb_build_object(
      'allowed', false,
      'error', 'Invalid source type'
    );
  end if;

  -- Call the appropriate private helper based on source type
  case p_source_type
    when 'person_document' then
      select allowed, bucket, path, file_name, mime_type, school_id, school_name
      into v_allowed, v_bucket, v_path, v_file_name, v_mime_type, v_school_id, v_school_name
      from (
        select
          private.can_access_my_person_document(p_source_id) as allowed,
          -- Determine bucket from persona
          case
            when p.persona = 'employee' then 'staff-documents'
            else 'student-documents'
          end as bucket,
          pd.file_path as path,
          pd.document_type as file_name,
          null::text as mime_type,
          pd.school_id,
          s.name as school_name
        from public.person_documents pd
        join public.people p on p.id = pd.person_id and p.school_id = pd.school_id
        join public.schools s on s.id = pd.school_id
        where pd.id = p_source_id
      ) sub;

    when 'report_card' then
      select
        private.can_access_report_card(p_source_id) as allowed,
        'report-cards' as bucket,
        rc.file_path as path,
        'Report Card' as file_name,
        'application/pdf' as mime_type,
        rc.school_id,
        s.name as school_name
      into v_allowed, v_bucket, v_path, v_file_name, v_mime_type, v_school_id, v_school_name
      from public.report_cards rc
      join public.schools s on s.id = rc.school_id
      where rc.id = p_source_id;

    when 'payment_receipt' then
      select
        private.can_access_payment_receipt(p_source_id) as allowed,
        'receipts' as bucket,
        pr.file_path as path,
        'Receipt ' || pr.receipt_number as file_name,
        'application/pdf' as mime_type,
        pr.school_id,
        s.name as school_name
      into v_allowed, v_bucket, v_path, v_file_name, v_mime_type, v_school_id, v_school_name
      from public.payment_receipts pr
      join public.schools s on s.id = pr.school_id
      where pr.id = p_source_id;

    when 'message_attachment' then
      select
        private.can_access_message_attachment(p_source_id) as allowed,
        'message-attachments' as bucket,
        ma.file_path as path,
        ma.file_name,
        ma.mime_type,
        ma.school_id,
        s.name as school_name
      into v_allowed, v_bucket, v_path, v_file_name, v_mime_type, v_school_id, v_school_name
      from public.message_attachments ma
      join public.schools s on s.id = ma.school_id
      where ma.id = p_source_id;
  end case;

  -- Return authorization result and safe metadata
  if v_allowed = true then
    return jsonb_build_object(
      'allowed', true,
      'bucket', v_bucket,
      'path', v_path,
      'file_name', v_file_name,
      'mime_type', v_mime_type,
      'school_id', v_school_id,
      'school_name', v_school_name
    );
  else
    return jsonb_build_object(
      'allowed', false,
      'error', 'Access denied'
    );
  end if;
end;
$$;

-- Lock down execution
revoke all on function public.can_download_private_file(text, uuid) from public, anon;
grant execute on function public.can_download_private_file(text, uuid) to authenticated, service_role;

-- Comment for documentation
comment on function public.can_download_private_file is 'Public wrapper for private file download authorization. Validates source type and calls appropriate private helper. Returns only authorization and safe metadata (never service keys or signing secrets).';

commit;
