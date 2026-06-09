-- Public-safe lookup for document verification (minimal student fields only).
-- This guard makes migration errors explicit when executed on a wrong DB/project.
do $$
begin
  if to_regclass('public.students') is null then
    raise exception using
      errcode = '42P01',
      message = 'Migration aborted: table "public.students" introuvable.',
      hint = 'Vérifiez le projet Supabase ciblé (link/project-ref) puis relancez la migration.';
  end if;
end $$;

create or replace function public.verify_student_document_public(
  p_student_id uuid default null,
  p_matricule text default null
)
returns table (
  id uuid,
  matricule text,
  nom text,
  postnom text,
  prenom text,
  domaine text,
  filiere text,
  promotion text,
  annee_academique text
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    s.matricule,
    s.nom,
    s.postnom,
    s.prenom,
    s.domaine,
    s.filiere,
    s.promotion,
    s.annee_academique
  from students s
  where s.status = 'approved'
    and (
      (p_student_id is not null and s.id = p_student_id)
      or
      (p_matricule is not null and s.matricule = p_matricule)
    )
  order by case when p_student_id is not null and s.id = p_student_id then 0 else 1 end
  limit 1;
$$;

revoke all on function public.verify_student_document_public(uuid, text) from public;
grant execute on function public.verify_student_document_public(uuid, text) to anon, authenticated;
