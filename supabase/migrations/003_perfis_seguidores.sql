-- Perfis públicos e relação de seguidores.
-- Executar manualmente no SQL Editor do Supabase, depois da 002.
--
-- Por que existe: o app não pode ler auth.users, então sem `perfis` ele não conseguiria mostrar o
-- nome dos outros jogadores em partidas e listas.
--
-- Limitações conhecidas:
-- - `perfis` guarda só o nome de exibição; o e-mail NÃO é copiado, para não ficar visível aos outros.
-- - O nome em `perfis` só acompanha o user_metadata quando a troca é feita pelo app. Uma alteração
--   direta no painel do Supabase não é copiada para cá.
-- - "Amigos" não é uma tabela: são os seguidores que o usuário também segue, calculado pelo app.
-- - Qualquer usuário logado pode ver quem segue quem.

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome_exibicao text not null,
  criado_em timestamptz not null default now()
);

create table public.seguidores (
  seguidor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  seguido_id uuid not null references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (seguidor_id, seguido_id),
  check (seguidor_id <> seguido_id)
);

-- A lista de seguidores busca por `seguido_id`; a chave primária só cobre a busca por `seguidor_id`.
create index seguidores_seguido_id_idx on public.seguidores (seguido_id);

alter table public.perfis enable row level security;
alter table public.seguidores enable row level security;

create policy "Usuários logados veem os perfis"
  on public.perfis for select
  to authenticated
  using (true);

create policy "Usuário atualiza o próprio perfil"
  on public.perfis for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Usuários logados veem quem segue quem"
  on public.seguidores for select
  to authenticated
  using (true);

create policy "Usuário segue em nome próprio"
  on public.seguidores for insert
  to authenticated
  with check (seguidor_id = auth.uid());

create policy "Usuário deixa de seguir em nome próprio"
  on public.seguidores for delete
  to authenticated
  using (seguidor_id = auth.uid());

revoke all on public.perfis from anon;
revoke all on public.seguidores from anon;

grant select, update on public.perfis to authenticated;
grant select, insert, delete on public.seguidores to authenticated;

-- Cria o perfil junto com a conta. Precisa de security definer porque quem dispara é o
-- serviço de autenticação, e não há policy de INSERT em `perfis`.
create function public.criar_perfil_do_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome_exibicao)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), 'Jogador'));
  return new;
end;
$$;

revoke all on function public.criar_perfil_do_novo_usuario() from public, anon, authenticated;

create trigger ao_criar_usuario_criar_perfil
  after insert on auth.users
  for each row execute function public.criar_perfil_do_novo_usuario();

-- Contas criadas antes desta migration.
insert into public.perfis (id, nome_exibicao)
select id, coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), 'Jogador')
from auth.users
on conflict (id) do nothing;
