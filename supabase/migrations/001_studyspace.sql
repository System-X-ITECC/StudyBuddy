begin; -- Apply the initial cloud schema atomically.
create table public.profiles (user_id uuid primary key references auth.users(id) on delete cascade, settings jsonb not null default '{}'::jsonb check (octet_length(settings::text)<16000)); -- Store only user-owned preference documents.
create table public.chats (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, title text not null check(char_length(title) between 1 and 100), created_at timestamptz not null default now(), lock_token uuid, lock_until timestamptz, unique(id,user_id)); -- Establish the ownership and generation-lease boundary.
create table public.sources (id uuid primary key default gen_random_uuid(), chat_id uuid not null, user_id uuid not null references auth.users(id) on delete cascade, name text not null, text text not null check(char_length(text) between 1 and 240000), url text not null default '', characters integer generated always as (char_length(text)) stored, foreign key(chat_id,user_id) references public.chats(id,user_id) on delete cascade); -- Keep evidence in one owned chat with a bounded text size.
create table public.messages (id uuid primary key default gen_random_uuid(), chat_id uuid not null, user_id uuid not null references auth.users(id) on delete cascade, role text not null check(role in ('user','assistant')), content text not null, created_at timestamptz not null default clock_timestamp(), unique(id,user_id), foreign key(chat_id,user_id) references public.chats(id,user_id) on delete cascade); -- Persist ordered chat turns with cross-owner foreign-key protection.
create table public.feedback (message_id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade, rating text not null check(rating in ('helpful','needs-work')), note text not null check(char_length(note)<=600), created_at timestamptz not null default now(), foreign key(message_id,user_id) references public.messages(id,user_id) on delete cascade); -- Link feedback to an answer owned by the same user.
create table public.achievements (user_id uuid not null references auth.users(id) on delete cascade, goal text not null check(goal in ('first-review','five-cards','study-plan')), primary key(user_id,goal)); -- Prevent duplicate milestone awards.
create table public.request_budgets (user_id uuid not null references auth.users(id) on delete cascade, kind text not null, minute timestamptz not null, used integer not null default 0, primary key(user_id,kind,minute)); -- Share rate counters across serverless instances.
create index chats_user_created on public.chats(user_id,created_at desc); -- Accelerate per-user conversation listings.
create index messages_chat_created on public.messages(chat_id,created_at,id); -- Accelerate bounded conversation history reads.
create index sources_chat on public.sources(chat_id); -- Accelerate evidence retrieval.
alter table public.request_budgets enable row level security; -- Deny direct counter access; the controlled function owns mutations.
revoke all on public.request_budgets from anon,authenticated; -- Prevent clients from resetting their rate budgets.
do $$ declare item text; begin -- Apply the same explicit ownership policy to each content table.
 foreach item in array array['profiles','chats','sources','messages','feedback','achievements'] loop -- Visit only the application-owned tables.
  execute format('alter table public.%I enable row level security',item); -- Enable row-level security before granting client access.
  execute format('create policy own_rows on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',item); -- Require both existing and new rows to belong to the signed-in user.
  execute format('grant select,insert,update,delete on public.%I to authenticated',item); -- Allow CRUD only within the RLS ownership boundary.
  execute format('revoke all on public.%I from anon',item); -- Deny unauthenticated direct data access.
 end loop; -- Finish ownership policy installation.
end $$; -- Finish the migration policy block.
create function public.consume_budget(p_kind text) returns boolean language plpgsql security definer set search_path='' as $$ -- Enforce a shared fixed-window request budget.
declare v_user uuid := auth.uid(); v_used integer; v_limit integer; v_minute timestamptz := date_trunc('minute',now()); begin -- Scope counters to the verified JWT user and current minute.
 if v_user is null or p_kind not in ('api','ai') then raise exception 'Unauthorized budget'; end if; -- Reject anonymous and arbitrary quota categories.
 v_limit := case when p_kind='ai' then 12 else 100 end; -- Bound model requests more strictly than general API traffic.
 delete from public.request_budgets where user_id=v_user and minute<v_minute-interval '10 minutes'; -- Keep active users' counter history small.
 insert into public.request_budgets(user_id,kind,minute,used) values(v_user,p_kind,v_minute,1) on conflict(user_id,kind,minute) do update set used=public.request_budgets.used+1 returning used into v_used; -- Increment atomically across instances.
 return v_used<=v_limit; -- Allow only requests within the fixed-window budget.
end $$; -- Finish distributed rate limiting.
create function public.claim_generation(p_chat uuid) returns uuid language plpgsql security invoker set search_path='' as $$ -- Acquire a database-backed generation lease.
declare lease uuid := gen_random_uuid(); owned uuid; begin -- Allocate a unique lease identity.
 update public.chats set lock_token=lease,lock_until=now()+interval '150 seconds' where id=p_chat and user_id=auth.uid() and (lock_until is null or lock_until<now()) returning id into owned; -- Atomically claim only an available owned chat.
 if owned is null then return null; end if; -- Signal that another request owns the active lease.
 return lease; -- Return the lease token for safe completion and release.
end $$; -- Finish lease acquisition.
create function public.release_generation(p_chat uuid,p_lease uuid) returns void language sql security invoker set search_path='' as $$ -- Release only this invocation's lease.
 update public.chats set lock_token=null,lock_until=null where id=p_chat and user_id=auth.uid() and lock_token=p_lease; -- Prevent a stale request from releasing a newer lease.
$$; -- Finish lease release.
create function public.finish_generation(p_chat uuid,p_lease uuid,p_question text,p_answer text) returns jsonb language plpgsql security invoker set search_path='' as $$ -- Commit a completed user/assistant turn in one transaction.
declare user_message uuid := gen_random_uuid(); assistant_message uuid := gen_random_uuid(); stamp timestamptz := clock_timestamp(); begin -- Allocate message identities and deterministic ordering.
 perform 1 from public.chats where id=p_chat and user_id=auth.uid() and lock_token=p_lease and lock_until>now() for update; -- Require ownership and a live lease before writing.
 if not found then raise exception 'Generation lease expired or conversation was deleted'; end if; -- Refuse stale or cross-chat commits.
 insert into public.messages(id,chat_id,user_id,role,content,created_at) values(user_message,p_chat,auth.uid(),'user',p_question,stamp),(assistant_message,p_chat,auth.uid(),'assistant',p_answer,stamp+interval '1 microsecond'); -- Save both messages together or neither.
 update public.chats set title=case when title='New conversation' then left(p_question,60) else title end,lock_token=null,lock_until=null where id=p_chat; -- Name a first conversation and release the successful lease.
 return jsonb_build_object('user_id',user_message,'assistant_id',assistant_message); -- Return message identifiers for the UI and feedback.
end $$; -- Finish transactional message persistence.
create function public.save_source(p_chat uuid,p_name text,p_text text,p_url text) returns table(id uuid,name text,url text,characters integer) language plpgsql security invoker set search_path='' as $$ -- Persist evidence under a per-chat limit.
begin -- Begin the source transaction.
 perform 1 from public.chats where chats.id=p_chat and user_id=auth.uid() for update; -- Serialize source-count checks on the owned chat.
 if not found then raise exception 'Conversation not found'; end if; -- Reject cross-account source insertion.
 if (select count(*) from public.sources where chat_id=p_chat)>=12 then raise exception 'Use up to 12 sources per conversation'; end if; -- Bound evidence retained per chat.
 return query insert into public.sources(chat_id,user_id,name,text,url) values(p_chat,auth.uid(),left(p_name,200),p_text,p_url) returning sources.id,sources.name,sources.url,sources.characters; -- Return metadata from the inserted evidence row.
end $$; -- Finish source persistence.
revoke all on function public.consume_budget(text), public.claim_generation(uuid), public.release_generation(uuid,uuid), public.finish_generation(uuid,uuid,text,text), public.save_source(uuid,text,text,text) from public; -- Remove default anonymous function execution.
grant execute on function public.consume_budget(text), public.claim_generation(uuid), public.release_generation(uuid,uuid), public.finish_generation(uuid,uuid,text,text), public.save_source(uuid,text,text,text) to authenticated; -- Permit only authenticated app users to call controlled operations.
commit; -- Publish the schema, RLS policies, functions together.
