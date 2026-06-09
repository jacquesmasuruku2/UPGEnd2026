-- Videos table (public website)
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  poster_url text,
  display_order int default 0,
  is_published boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.videos enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'videos' and policyname = 'Videos publicly readable'
  ) then
    create policy "Videos publicly readable"
      on public.videos
      for select
      using (is_published = true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'videos' and policyname = 'Authenticated users can manage videos'
  ) then
    create policy "Authenticated users can manage videos"
      on public.videos
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

create index if not exists idx_videos_display_order on public.videos (display_order asc nulls last);
create index if not exists idx_videos_created_at on public.videos (created_at desc);
create index if not exists idx_videos_published_order on public.videos (is_published, display_order asc nulls last, created_at desc);

create or replace function public.update_videos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_videos_updated_at on public.videos;
create trigger trg_videos_updated_at
before update on public.videos
for each row
execute function public.update_videos_updated_at();

-- Storage bucket for videos
insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Videos publicly accessible'
  ) then
    create policy "Videos publicly accessible"
      on storage.objects
      for select
      using (bucket_id = 'videos');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users can upload videos'
  ) then
    create policy "Authenticated users can upload videos"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'videos');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users can update videos'
  ) then
    create policy "Authenticated users can update videos"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'videos');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Authenticated users can delete videos'
  ) then
    create policy "Authenticated users can delete videos"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'videos');
  end if;
end $$;
