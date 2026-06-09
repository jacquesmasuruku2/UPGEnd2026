-- Journalisation des vérifications de documents (QR carte, relevé, etc.)
create table if not exists public.document_verification_logs (
  id uuid primary key default gen_random_uuid(),
  verifier_user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null default 'unknown',
  student_id uuid references public.students(id) on delete set null,
  qr_raw text not null,
  is_known boolean not null default false,
  message text not null,
  checks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.document_verification_logs enable row level security;

drop policy if exists "Authenticated can insert verification logs" on public.document_verification_logs;
create policy "Authenticated can insert verification logs"
on public.document_verification_logs
for insert
to authenticated
with check (auth.uid() = verifier_user_id);

drop policy if exists "Authenticated can view verification logs" on public.document_verification_logs;
create policy "Authenticated can view verification logs"
on public.document_verification_logs
for select
to authenticated
using (true);
