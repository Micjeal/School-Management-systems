create or replace function public.create_conversation_with_members(
  target_school_id uuid,
  target_title text,
  target_conversation_type text,
  target_member_user_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_conversation public.conversations;
  v_member uuid;
  v_member_count integer := 0;
begin
  if not private.has_permission(target_school_id,'communications.send') then
    raise exception 'Permission denied' using errcode='42501';
  end if;
  if target_conversation_type not in ('direct','group','class','support') then
    raise exception 'Unsupported conversation type';
  end if;
  insert into public.conversations(school_id,title,conversation_type,created_by,is_closed)
  values(target_school_id,nullif(trim(target_title),''),target_conversation_type,auth.uid(),false)
  returning * into v_conversation;

  insert into public.conversation_members(conversation_id,user_id,role)
  values(v_conversation.id,auth.uid(),'owner')
  on conflict (conversation_id,user_id) do update set left_at=null,role='owner';

  foreach v_member in array coalesce(target_member_user_ids,array[]::uuid[])
  loop
    if v_member=auth.uid() then continue; end if;
    if not exists(
      select 1 from public.school_memberships
      where school_id=target_school_id and user_id=v_member and status='active'
    ) then
      raise exception 'Conversation member % is not an active school member',v_member;
    end if;
    insert into public.conversation_members(conversation_id,user_id,role)
    values(v_conversation.id,v_member,'member')
    on conflict (conversation_id,user_id) do update set left_at=null,role='member';
    v_member_count := v_member_count+1;
    insert into public.notifications(school_id,user_id,notification_type,title,body,action_url,data)
    values(target_school_id,v_member,'conversation','New conversation',coalesce(v_conversation.title,'A new conversation was started'),'/app/messages/'||v_conversation.id,jsonb_build_object('conversation_id',v_conversation.id));
  end loop;

  if target_conversation_type='direct' and v_member_count<>1 then
    raise exception 'Direct conversations require exactly one other member';
  end if;
  return jsonb_build_object('conversation_id',v_conversation.id,'members',v_member_count+1);
end;
$$;

create or replace function public.send_conversation_message(
  target_conversation_id uuid,
  target_body text,
  target_reply_to_message_id uuid default null
)
returns public.messages
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_conversation public.conversations;
  v_message public.messages;
  v_member record;
begin
  select * into v_conversation from public.conversations where id=target_conversation_id;
  if not found then raise exception 'Conversation not found'; end if;
  if not private.is_conversation_member(v_conversation.id) then
    raise exception 'Conversation access denied' using errcode='42501';
  end if;
  if v_conversation.is_closed then raise exception 'Conversation is closed'; end if;
  if coalesce(trim(target_body),'')='' then raise exception 'Message cannot be empty'; end if;
  if target_reply_to_message_id is not null and not exists(
    select 1 from public.messages where id=target_reply_to_message_id and conversation_id=v_conversation.id
  ) then raise exception 'Reply message does not belong to this conversation'; end if;

  insert into public.messages(
    school_id,conversation_id,sender_user_id,message_type,body,reply_to_message_id,metadata
  ) values (
    v_conversation.school_id,v_conversation.id,auth.uid(),'text',trim(target_body),target_reply_to_message_id,'{}'::jsonb
  ) returning * into v_message;
  update public.conversations set updated_at=now() where id=v_conversation.id;
  update public.conversation_members set last_read_at=now()
  where conversation_id=v_conversation.id and user_id=auth.uid();

  for v_member in
    select cm.user_id from public.conversation_members cm
    where cm.conversation_id=v_conversation.id and cm.user_id<>auth.uid() and cm.left_at is null and not cm.is_muted
  loop
    insert into public.notifications(school_id,user_id,notification_type,title,body,action_url,data)
    values(v_conversation.school_id,v_member.user_id,'message',coalesce(v_conversation.title,'New message'),left(trim(target_body),240),'/app/messages/'||v_conversation.id,jsonb_build_object('conversation_id',v_conversation.id,'message_id',v_message.id));
  end loop;
  return v_message;
end;
$$;

create or replace function public.mark_conversation_read(target_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if not private.is_conversation_member(target_conversation_id) then
    raise exception 'Conversation access denied' using errcode='42501';
  end if;
  update public.conversation_members set last_read_at=now()
  where conversation_id=target_conversation_id and user_id=auth.uid();
end;
$$;

create or replace function public.set_conversation_closed(
  target_conversation_id uuid,
  target_closed boolean
)
returns public.conversations
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare v_conversation public.conversations;
begin
  select c.* into v_conversation
  from public.conversations c
  join public.conversation_members cm on cm.conversation_id=c.id
  where c.id=target_conversation_id and cm.user_id=auth.uid() and cm.left_at is null and cm.role in ('owner','moderator')
  for update of c;
  if not found then raise exception 'Conversation administration denied' using errcode='42501'; end if;
  update public.conversations set is_closed=target_closed,updated_at=now()
  where id=v_conversation.id returning * into v_conversation;
  return v_conversation;
end;
$$;

revoke all on function public.create_conversation_with_members(uuid,text,text,uuid[]) from public, anon;
revoke all on function public.send_conversation_message(uuid,text,uuid) from public, anon;
revoke all on function public.mark_conversation_read(uuid) from public, anon;
revoke all on function public.set_conversation_closed(uuid,boolean) from public, anon;
grant execute on function public.create_conversation_with_members(uuid,text,text,uuid[]) to authenticated, service_role;
grant execute on function public.send_conversation_message(uuid,text,uuid) to authenticated, service_role;
grant execute on function public.mark_conversation_read(uuid) to authenticated, service_role;
grant execute on function public.set_conversation_closed(uuid,boolean) to authenticated, service_role;
