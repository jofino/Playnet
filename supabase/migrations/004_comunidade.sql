-- Comunidade: publicações só de texto, curtidas e comentários, além do índice da busca de contas.
-- Executar manualmente no SQL Editor do Supabase, depois da 002 e da 003.
--
-- As policies de `perfis` e `seguidores` foram revisadas e continuam como estão na 003.
--
-- Limitações conhecidas:
-- - Não há limite de frequência no servidor: um usuário pode publicar, comentar e curtir sem parar.
-- - Não há edição: publicações e comentários só podem ser criados e apagados.
-- - Não há denúncia, bloqueio nem moderação no app; só o autor apaga o próprio conteúdo. Isso
--   precisa existir antes da publicação nas lojas.
-- - Só o autor apaga um comentário; o dono da publicação não consegue apagar comentários de outros.
-- - Tudo é visível para qualquer usuário logado; não há conta privada.
-- - O limite de caracteres conta pontos de código; o app conta unidades UTF-16, que é mais restrito
--   para emojis, então o que o app aceita sempre cabe aqui.
-- - O feed "Seguindo" envia ao banco os ids de quem o usuário segue, o que não funciona para
--   milhares de contas seguidas (URL grande demais).
-- - Os totais da view são calculados a cada leitura, sem contador armazenado. Com muito volume, isso
--   vai precisar de revisão.
-- - Na busca, o índice de trigramas não ajuda em termos de 2 caracteres, que percorrem a tabela.

-- O `ilike` com '%termo%' só aproveita índice com trigramas.
create extension if not exists pg_trgm with schema extensions;

create table public.publicacoes (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 500 and texto ~ '\S'),
  criado_em timestamptz not null default now()
);

create table public.publicacao_curtidas (
  publicacao_id uuid not null references public.publicacoes (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  primary key (publicacao_id, user_id)
);

create table public.publicacao_comentarios (
  id uuid primary key default gen_random_uuid(),
  publicacao_id uuid not null references public.publicacoes (id) on delete cascade,
  autor_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  texto text not null check (char_length(texto) between 1 and 300 and texto ~ '\S'),
  criado_em timestamptz not null default now()
);

-- O feed ordena por data, com o id para desempatar a paginação.
create index publicacoes_criado_em_idx on public.publicacoes (criado_em desc, id desc);
-- O feed "Seguindo" e o perfil de uma pessoa filtram por autor.
create index publicacoes_autor_id_idx on public.publicacoes (autor_id, criado_em desc, id desc);
create index publicacao_curtidas_user_id_idx on public.publicacao_curtidas (user_id);
create index publicacao_comentarios_publicacao_id_idx
  on public.publicacao_comentarios (publicacao_id, criado_em);
create index publicacao_comentarios_autor_id_idx on public.publicacao_comentarios (autor_id);
-- Busca de contas por nome de exibição.
create index perfis_nome_exibicao_busca_idx
  on public.perfis using gin (nome_exibicao extensions.gin_trgm_ops);

alter table public.publicacoes enable row level security;
alter table public.publicacao_curtidas enable row level security;
alter table public.publicacao_comentarios enable row level security;

create policy "Usuários logados veem as publicações"
  on public.publicacoes for select
  to authenticated
  using (true);

create policy "Usuário publica em nome próprio"
  on public.publicacoes for insert
  to authenticated
  with check (autor_id = auth.uid());

create policy "Autor apaga a própria publicação"
  on public.publicacoes for delete
  to authenticated
  using (autor_id = auth.uid());

create policy "Usuários logados veem as curtidas"
  on public.publicacao_curtidas for select
  to authenticated
  using (true);

create policy "Usuário curte em nome próprio"
  on public.publicacao_curtidas for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Usuário desfaz a própria curtida"
  on public.publicacao_curtidas for delete
  to authenticated
  using (user_id = auth.uid());

create policy "Usuários logados veem os comentários"
  on public.publicacao_comentarios for select
  to authenticated
  using (true);

create policy "Usuário comenta em nome próprio"
  on public.publicacao_comentarios for insert
  to authenticated
  with check (autor_id = auth.uid());

create policy "Autor apaga o próprio comentário"
  on public.publicacao_comentarios for delete
  to authenticated
  using (autor_id = auth.uid());

-- O que o feed mostra de cada publicação. `security_invoker` faz a view respeitar o RLS de quem
-- consulta; sem isso, ela leria as tabelas com as permissões do dono da view.
create view public.publicacoes_feed
with (security_invoker = true)
as
select
  p.id,
  p.autor_id,
  coalesce(autor.nome_exibicao, 'Jogador') as autor_nome,
  p.texto,
  p.criado_em,
  (select count(*) from public.publicacao_curtidas c where c.publicacao_id = p.id)::int as total_curtidas,
  (select count(*) from public.publicacao_comentarios c where c.publicacao_id = p.id)::int as total_comentarios,
  exists (
    select 1 from public.publicacao_curtidas c
    where c.publicacao_id = p.id and c.user_id = auth.uid()
  ) as curtida_por_mim
from public.publicacoes p
left join public.perfis autor on autor.id = p.autor_id;

-- O projeto pode estar com "expose new tables" desativado, então os acessos são explícitos.
-- O revoke cobre o caso contrário, em que o Supabase concede tudo automaticamente aos dois roles;
-- sem ele, o grant abaixo não restringiria nada para `authenticated`.
revoke all on public.publicacoes from anon, authenticated;
revoke all on public.publicacao_curtidas from anon, authenticated;
revoke all on public.publicacao_comentarios from anon, authenticated;
revoke all on public.publicacoes_feed from anon, authenticated;

grant select, insert, delete on public.publicacoes to authenticated;
grant select, insert, delete on public.publicacao_curtidas to authenticated;
grant select, insert, delete on public.publicacao_comentarios to authenticated;
grant select on public.publicacoes_feed to authenticated;
