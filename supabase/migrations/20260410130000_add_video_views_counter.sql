alter table public.videos
add column if not exists views_count integer not null default 0;

create or replace function public.increment_video_views(p_video_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
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

grant execute on function public.increment_video_views(uuid) to anon, authenticated;
