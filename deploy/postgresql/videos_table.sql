-- Table des vidéos publiées sur la page "Nos Vidéos"
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_url text not null,
  poster_url text,
  source_url text,
  display_order integer default 0,
  is_published boolean default true,
  views_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_videos_display_order on public.videos (display_order asc nulls last);
create index if not exists idx_videos_published on public.videos (is_published);
create index if not exists idx_videos_published_order on public.videos (is_published, display_order asc nulls last, created_at desc);

create or replace function public.set_videos_updated_at()
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
execute function public.set_videos_updated_at();

create or replace function public.increment_video_views(p_video_id uuid)
returns integer
language plpgsql
as $$
declare
  v_count integer;
begin
  update public.videos
  set views_count = coalesce(views_count, 0) + 1
  where id = p_video_id
  returning views_count into v_count;

  return coalesce(v_count, 0);
end;
$$;
