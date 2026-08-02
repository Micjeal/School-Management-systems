-- SchoolDB files secure authorization helpers
-- Creates narrow authorization helpers for the personal /app/files page
-- Uses correct live schema relationships

begin;

-- Helper: Check if guardian can receive student academic files
-- Requires active guardian relationship with receives_academic_reports = true
create or replace function private.can_receive_student_academic_files(
  target_school_id uuid,
  target_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
  select exists (
    select 1
    from public.student_guardians sg
    join public.guardians g
      on g.id = sg.guardian_id
     and g.school_id = sg.school_id
    join public.people gp
      on gp.id = g.person_id
     and gp.school_id = g.school_id
    join public.students s
      on s.id = sg.student_id
     and s.school_id = sg.school_id
    where sg.school_id = target_school_id
      and sg.student_id = target_student_id
      and gp.user_id = auth.uid()
      and g.status = 'active'
      and coalesce(g.portal_enabled, false)
      and s.status = 'active'
      and sg.receives_academic_reports = true
  );
$$;

-- Helper: Check if guardian can receive student financial files
-- Requires active guardian relationship with receives_financial_notices = true OR is_financially_responsible = true
create or replace function private.can_receive_student_financial_files(
  target_school_id uuid,
  target_student_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
  select exists (
    select 1
    from public.student_guardians sg
    join public.guardians g
      on g.id = sg.guardian_id
     and g.school_id = sg.school_id
    join public.people gp
      on gp.id = g.person_id
     and gp.school_id = g.school_id
    join public.students s
      on s.id = sg.student_id
     and s.school_id = s.school_id
    where sg.school_id = target_school_id
      and sg.student_id = target_student_id
      and gp.user_id = auth.uid()
      and g.status = 'active'
      and coalesce(g.portal_enabled, false)
      and s.status = 'active'
      and (
        sg.receives_financial_notices = true
        or sg.is_financially_responsible = true
      )
  );
$$;

-- Helper: Check if user can access their own person document
-- Owner-only access for personal files page - no administrative access
create or replace function private.can_access_my_person_document(
  target_document_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
  select exists (
    select 1
    from public.person_documents pd
    join public.people p
      on p.id = pd.person_id
     and p.school_id = pd.school_id
    where pd.id = target_document_id
      and p.user_id = auth.uid()
  );
$$;

-- Helper: Check if user can access a specific report card
-- Only published report cards, for own student or authorized guardian
create or replace function private.can_access_report_card(
  target_report_card_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
  select exists (
    select 1
    from public.report_cards rc
    join public.students s
      on s.id = rc.student_id
     and s.school_id = rc.school_id
    join public.people sp
      on sp.id = s.person_id
     and sp.school_id = s.school_id
    where rc.id = target_report_card_id
      and rc.status = 'published'
      and rc.file_path is not null
      and (
        sp.user_id = auth.uid()
        or private.can_receive_student_academic_files(
          rc.school_id,
          rc.student_id
        )
      )
  );
$$;

-- Helper: Check if user can access a specific payment receipt
-- For own student or authorized guardian only - no finance.read for personal page
create or replace function private.can_access_payment_receipt(
  target_receipt_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
  select exists (
    select 1
    from public.payment_receipts pr
    join public.payments pay
      on pay.id = pr.payment_id
     and pay.school_id = pr.school_id
    left join public.students s
      on s.id = pay.student_id
     and s.school_id = pay.school_id
    left join public.people sp
      on sp.id = s.person_id
     and sp.school_id = s.school_id
    where pr.id = target_receipt_id
      and pr.file_path is not null
      and (
        sp.user_id = auth.uid()
        or (
          pay.student_id is not null
          and private.can_receive_student_financial_files(
            pr.school_id,
            pay.student_id
          )
        )
      )
  );
$$;

-- Helper: Check if user can access a specific message attachment
-- Only for messages in conversations the user participates in
create or replace function private.can_access_message_attachment(
  target_attachment_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public, private, pg_temp
as $$
  select exists (
    select 1
    from public.message_attachments ma
    join public.messages m
      on m.id = ma.message_id
     and m.school_id = ma.school_id
    where ma.id = target_attachment_id
      and private.is_conversation_member(
        m.conversation_id
      )
  );
$$;

-- Lock down helper execution
revoke all on function private.can_receive_student_academic_files(uuid, uuid) from public, anon;
grant execute on function private.can_receive_student_academic_files(uuid, uuid) to authenticated, service_role;

revoke all on function private.can_receive_student_financial_files(uuid, uuid) from public, anon;
grant execute on function private.can_receive_student_financial_files(uuid, uuid) to authenticated, service_role;

revoke all on function private.can_access_my_person_document(uuid) from public, anon;
grant execute on function private.can_access_my_person_document(uuid) to authenticated, service_role;

revoke all on function private.can_access_report_card(uuid) from public, anon;
grant execute on function private.can_access_report_card(uuid) to authenticated, service_role;

revoke all on function private.can_access_payment_receipt(uuid) from public, anon;
grant execute on function private.can_access_payment_receipt(uuid) to authenticated, service_role;

revoke all on function private.can_access_message_attachment(uuid) from public, anon;
grant execute on function private.can_access_message_attachment(uuid) to authenticated, service_role;

-- Comments for documentation
comment on function private.can_receive_student_academic_files is 'Check if authenticated guardian can receive academic files for a student (requires receives_academic_reports = true, uses correct guardian relationship)';
comment on function private.can_receive_student_financial_files is 'Check if authenticated guardian can receive financial files for a student (requires receives_financial_notices = true OR is_financially_responsible = true, uses correct guardian relationship)';
comment on function private.can_access_my_person_document is 'Owner-only access to person documents - no administrative access for personal files page';
comment on function private.can_access_report_card is 'Check if authenticated user can access a specific report card (only published, own student or authorized guardian)';
comment on function private.can_access_payment_receipt is 'Check if authenticated user can access a specific payment receipt (own student or authorized guardian only - no finance.read for personal page)';
comment on function private.can_access_message_attachment is 'Check if authenticated user can access a specific message attachment (only in conversations they participate in via is_conversation_member)';

commit;
