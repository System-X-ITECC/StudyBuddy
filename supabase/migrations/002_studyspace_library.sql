-- StudySpace private Library extension. Run AFTER 001_studyspace.sql in the correct testbed project.
-- Keep this file versioned and apply separately to production only after explicit release approval.
begin;
create table public.library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_chat_id uuid,
  constraint library_owned_chat foreign key (source_chat_id,user_id) references public.chats(id,user_id) on delete set null (source_chat_id),
  title text not null check (char_length(title) between 1 and 120),
  category text not null check (category in ('summary','review','flashcards','textbook','slides','planner','image','audio','video','document','other')),
  tags text[] not null default '{}'::text[] check (cardinality(tags) <= 10),
  content jsonb,
  storage_path text unique,
  mime_type text not null default 'application/json',
  bytes integer not null default 0 check (bytes >= 0 and bytes <= 10485760),
  created_at timestamptz not null default now(),
  constraint has_exactly_one_payload check ((content is null) <> (storage_path is null)),
  constraint bounded_generated_payload check (content is null or octet_length(content::text) <= 500000),
  constraint owned_storage_prefix check (storage_path is null or storage_path like user_id::text || '/%')
);
create index library_items_user_created on public.library_items(user_id, created_at desc);
create index library_items_user_category on public.library_items(user_id, category);
create index library_items_tags_gin on public.library_items using gin(tags);
alter table public.library_items enable row level security;
create policy library_private_rows on public.library_items
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
grant select,insert,update,delete on public.library_items to authenticated;
revoke all on public.library_items from anon;

-- Supabase Storage contains binary uploads; PostgreSQL contains only metadata and generated JSON.
-- There are NO public file URLs. RLS requires paths starting with the signed-in user's UUID.
insert into storage.buckets(id,name,public,file_size_limit)
  values ('studyspace-library','studyspace-library',false,10485760)
  on conflict (id) do update set public = false, file_size_limit = 10485760;
create policy studyspace_library_select on storage.objects for select to authenticated
  using (bucket_id = 'studyspace-library' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy studyspace_library_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'studyspace-library' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy studyspace_library_delete on storage.objects for delete to authenticated
  using (bucket_id = 'studyspace-library' and (storage.foldername(name))[1] = (select auth.uid())::text);
commit;
