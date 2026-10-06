-- Execute no SQL Editor do seu projeto Supabase.
-- Se já houver uma tabela respostas com outro esquema, adapte-a antes de executar.
begin;

create table public.respostas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 10000),
  resposta text not null check (char_length(resposta) > 0),
  created_at timestamptz not null default now()
);

create index respostas_user_created_idx
  on public.respostas (user_id, created_at desc, id desc);

alter table public.respostas enable row level security;

revoke all on public.respostas from anon, authenticated;
grant select, insert on public.respostas to authenticated;

create policy "Cada pessoa le suas respostas"
  on public.respostas for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Cada pessoa salva suas respostas"
  on public.respostas for insert to authenticated
  with check ((select auth.uid()) = user_id);

commit;
