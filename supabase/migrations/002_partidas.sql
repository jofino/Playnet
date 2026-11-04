-- Partidas e participantes.
-- Executar manualmente no SQL Editor do Supabase.
--
-- Limitações conhecidas:
-- - O limite de vagas NÃO é imposto pelo banco, só pelo app. O check abaixo limita o valor da
--   coluna `vagas`, mas nada impede mais linhas em `partida_participantes` do que vagas. Duas
--   pessoas entrando ao mesmo tempo na última vaga podem ultrapassar o limite.
-- - O criador entra como participante por um segundo INSERT feito pelo app, fora de uma transação.
--   Se esse INSERT falhar, o app tenta apagar a partida, mas essa limpeza pode falhar também.
-- - O criador pode sair da própria partida; ela continua existindo, mesmo sem participantes.
-- - `esporte` e `nivel` são texto livre no banco; os valores válidos são definidos pelo app.
-- - Não há bloqueio para criar partidas com data no passado; quem valida a data é o app.

create table public.partidas (
  id uuid primary key default gen_random_uuid(),
  criador_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  esporte text not null,
  local text not null,
  cidade text not null,
  nivel text not null,
  data_hora timestamptz not null,
  vagas int not null check (vagas between 1 and 20),
  criado_em timestamptz not null default now()
);

create table public.partida_participantes (
  partida_id uuid not null references public.partidas (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (partida_id, user_id)
);

-- A lista de próximas partidas filtra e ordena por data.
create index partidas_data_hora_idx on public.partidas (data_hora);
-- O histórico busca as partidas de um usuário; a chave primária só cobre a busca por partida.
create index partida_participantes_user_id_idx on public.partida_participantes (user_id);

alter table public.partidas enable row level security;
alter table public.partida_participantes enable row level security;

create policy "Usuários logados veem as partidas"
  on public.partidas for select
  to authenticated
  using (true);

create policy "Usuários logados criam partidas em nome próprio"
  on public.partidas for insert
  to authenticated
  with check (criador_id = auth.uid());

create policy "Criador atualiza a própria partida"
  on public.partidas for update
  to authenticated
  using (criador_id = auth.uid())
  with check (criador_id = auth.uid());

create policy "Criador apaga a própria partida"
  on public.partidas for delete
  to authenticated
  using (criador_id = auth.uid());

create policy "Usuários logados veem os participantes"
  on public.partida_participantes for select
  to authenticated
  using (true);

create policy "Usuário entra em partidas em nome próprio"
  on public.partida_participantes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Usuário sai de partidas em nome próprio"
  on public.partida_participantes for delete
  to authenticated
  using (user_id = auth.uid());

-- O projeto pode estar com "expose new tables" desativado, então os acessos são explícitos.
-- O revoke cobre o caso contrário, em que o Supabase concede acesso ao anon automaticamente.
revoke all on public.partidas from anon;
revoke all on public.partida_participantes from anon;

grant select, insert, update, delete on public.partidas to authenticated;
grant select, insert, delete on public.partida_participantes to authenticated;
