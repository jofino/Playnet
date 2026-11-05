-- Esportes e cidades: as tabelas de base que a 007 e a 008 usam.
-- Executar manualmente no SQL Editor do Supabase, depois da 005. Passa ou falha por inteiro, e pode ser
-- executada de novo sem erro. O app ainda não lê estas tabelas: isso começa na 008.
--
-- O que faz:
-- 1. Cria `esportes` e insere os 6 esportes, com os nomes de src/constants/sports.ts e as modalidades de
--    SPORT_MODALITIES em src/constants/scoring.ts.
-- 2. Cria `cidades` vazia, com os índices de busca por prefixo e por UF. A carga dos municípios é a 007.
-- 3. Deixa as duas tabelas só para leitura de `authenticated`. `anon` não tem acesso e ninguém escreve
--    pelo app; os dados mudam só por migration.
--
-- Limitações conhecidas:
-- - O check de `uf` confere só o formato: `XX` passa. O banco também não confere se `nome_busca` está em
--   minúsculas e sem acento. Quem garante os dois é a carga da 007.
-- - A busca é por prefixo: "paulo" não encontra "São Paulo". A consulta precisa usar `like`, não `ilike`,
--   com o termo normalizado do mesmo jeito que `nome_busca`, para aproveitar o índice.
-- - Executar de novo não corrige dados nem estrutura: um esporte alterado à mão continua alterado, e uma
--   tabela que já exista com outra estrutura continua como está.
-- - Até a 008, os nomes dos esportes ficam aqui e em src/constants/sports.ts.
--
-- VERIFICAÇÃO, depois de executar. É um único comando porque o SQL Editor só mostra o resultado do último:
--
-- INICIO DA VERIFICACAO
-- select 'esportes: total' as item, count(*)::text as resultado from public.esportes
-- union all
-- select 'cidades: total', count(*)::text from public.cidades
-- union all
-- select 'esporte: ' || ordem || ' ' || id,
--   nome || ' | simples=' || permite_simples || ' | duplas=' || permite_duplas
-- from public.esportes
-- union all
-- select 'rls: ' || relname::text, relrowsecurity::text
-- from pg_class
-- where oid in ('public.esportes'::regclass, 'public.cidades'::regclass)
-- union all
-- select 'privilegio: ' || table_name::text, grantee::text || ' ' || privilege_type::text
-- from information_schema.role_table_grants
-- where table_schema = 'public'
--   and table_name in ('esportes', 'cidades')
--   and grantee in ('anon', 'authenticated', 'PUBLIC')
-- union all
-- select 'policy: ' || tablename::text,
--   cmd || ' | ' || array_to_string(roles, ',') || ' | using ' || coalesce(qual, '-') || ' | check ' || coalesce(with_check, '-')
-- from pg_policies
-- where schemaname = 'public' and tablename in ('esportes', 'cidades')
-- order by 1, 2;
-- FIM DA VERIFICACAO
--
-- Esperado, 14 linhas:
--   cidades: total          0 (antes da 007)
--   esporte: 1 tenis           Tênis | simples=true | duplas=true
--   esporte: 2 beach-tennis    Beach Tennis | simples=false | duplas=true
--   esporte: 3 futevolei       Futevôlei | simples=false | duplas=true
--   esporte: 4 volei-de-praia  Vôlei de Praia | simples=false | duplas=true
--   esporte: 5 padel           Padel | simples=false | duplas=true
--   esporte: 6 tenis-de-mesa   Tênis de Mesa | simples=true | duplas=true
--   esportes: total         6
--   policy: cidades         SELECT | authenticated | using true | check -
--   policy: esportes        SELECT | authenticated | using true | check -
--   privilegio: cidades     authenticated SELECT
--   privilegio: esportes    authenticated SELECT
--   rls: cidades            true
--   rls: esportes           true
-- Qualquer linha com `anon`, `PUBLIC`, ou com outra policy ou privilégio, é um problema. `service_role` não
-- entra na consulta: não é alterado aqui e não é usado no app.
--
-- REVERSÃO (só se precisar voltar). Apaga também os municípios da 007. Primeiro, esta consulta precisa
-- voltar vazia:
--   select conrelid::regclass as tabela, conname as chave
--   from pg_constraint
--   where confrelid in ('public.esportes'::regclass, 'public.cidades'::regclass);
-- Os comandos abaixo não usam `cascade`: se algo ainda referenciar as tabelas, o Postgres recusa e nada é
-- apagado.
--
-- INICIO DA REVERSAO
-- begin;
-- drop table if exists public.cidades;
-- drop table if exists public.esportes;
-- commit;
-- FIM DA REVERSAO

begin;

create table if not exists public.esportes (
  id text primary key,
  nome text not null,
  ordem integer not null,
  permite_simples boolean not null,
  permite_duplas boolean not null
);

create table if not exists public.cidades (
  id integer primary key,
  nome text not null,
  uf char(2) not null check (uf ~ '^[A-Z]{2}$'),
  nome_busca text not null
);

-- O seletor de cidade busca por prefixo; text_pattern_ops serve ao `like` em qualquer collation.
create index if not exists cidades_nome_busca_idx on public.cidades (nome_busca text_pattern_ops);
-- O Ranking filtra por estado.
create index if not exists cidades_uf_idx on public.cidades (uf);

alter table public.esportes enable row level security;
alter table public.cidades enable row level security;

drop policy if exists "Usuários logados veem os esportes" on public.esportes;
create policy "Usuários logados veem os esportes"
  on public.esportes for select
  to authenticated
  using (true);

drop policy if exists "Usuários logados veem as cidades" on public.cidades;
create policy "Usuários logados veem as cidades"
  on public.cidades for select
  to authenticated
  using (true);

-- O revoke cobre os privilégios padrão do Supabase, caso ainda existam.
revoke all on public.esportes, public.cidades from anon, authenticated;
grant select on public.esportes, public.cidades to authenticated;

insert into public.esportes (id, nome, ordem, permite_simples, permite_duplas) values
  ('tenis', 'Tênis', 1, true, true),
  ('beach-tennis', 'Beach Tennis', 2, false, true),
  ('futevolei', 'Futevôlei', 3, false, true),
  ('volei-de-praia', 'Vôlei de Praia', 4, false, true),
  ('padel', 'Padel', 5, false, true),
  ('tenis-de-mesa', 'Tênis de Mesa', 6, true, true)
on conflict (id) do nothing;

commit;
