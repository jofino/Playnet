-- Privilégios padrão de `postgres` em `public`: tabelas, funções e sequências criadas depois disto não nascem
-- com acesso para `anon` e `authenticated`.
-- Executar manualmente no SQL Editor do Supabase, como `postgres`, depois da 006. Passa ou falha por inteiro,
-- e pode ser executada de novo sem erro. O nome 006b mantém a numeração da 007 e da 008 do documento.
--
-- Por que existe: confirmado no pg_default_acl deste projeto que `postgres` e `supabase_admin` concedem acesso
-- total a `anon` e `authenticated` em tabelas, funções e sequências criadas por eles. A 005 trata tabelas e
-- funções, mas não sequências.
--
-- O que faz:
-- 1. Retira `anon` e `authenticated` dos privilégios padrão de `postgres` em `public`, nos três tipos de objeto.
-- 2. Não muda nenhum objeto que já existe, nem `service_role`.
--
-- Efeitos a partir daqui, para objetos criados por `postgres`, inclusive pelo Table Editor:
-- - Uma tabela nova fica inacessível ao app até receber GRANT explícito.
-- - Uma coluna `serial` em tabela que `authenticated` preenche precisa de `grant usage` na sequência. Coluna
--   `generated ... as identity` não precisa.
--
-- Limitações: estes comandos NÃO estão aqui.
-- - `alter default privileges for role supabase_admin in schema public revoke all on tables (e functions,
--   sequences) from anon, authenticated`: exige ser `supabase_admin` ou membro dele, o que não se espera do
--   `postgres` no Supabase. Para confirmar, `select pg_has_role('postgres', 'supabase_admin', 'USAGE');` deve
--   dar false. Tentar sem a permissão derrubaria a transação. O que `supabase_admin` criar em `public` continua
--   nascendo com acesso para os dois roles. As migrations deste projeto rodam como `postgres` e não passam por isso.
-- - `alter default privileges for role postgres revoke execute on functions from public`: funções novas
--   continuam executáveis por PUBLIC, o que inclui `anon`, porque esse padrão é global e `in schema` não o
--   retira. A versão global afetaria todos os esquemas e as extensões instaladas depois. Por isso, cada função
--   nova precisa de `revoke execute ... from public, anon, authenticated`. Revogar só de `anon` e `authenticated`
--   não basta.
-- - Entradas globais (esquema `(todos)` na consulta abaixo) não saem com `in schema`. Se aparecerem para `anon`
--   ou `authenticated`, não foram tratadas aqui.
--
-- VERIFICAÇÃO, depois de executar:
--
-- INICIO DA VERIFICACAO
-- select r.rolname as dono,
--   coalesce(n.nspname, '(todos)') as esquema,
--   d.defaclobjtype as tipo,
--   g.rolname as beneficiado,
--   string_agg(acl.privilege_type, ', ' order by acl.privilege_type) as privilegios
-- from pg_default_acl d
-- join pg_roles r on r.oid = d.defaclrole
-- left join pg_namespace n on n.oid = d.defaclnamespace
-- cross join lateral aclexplode(d.defaclacl) as acl
-- join pg_roles g on g.oid = acl.grantee
-- where (d.defaclnamespace = 0 or n.nspname = 'public')
--   and g.rolname in ('anon', 'authenticated')
-- group by 1, 2, 3, 4
-- order by 1, 2, 3, 4;
-- FIM DA VERIFICACAO
--
-- Esperado: NENHUMA linha com dono `postgres`. Devem restar 6 linhas de `supabase_admin` em `public`, uma para
-- cada combinação de tipo (r tabelas, f funções, S sequências) e beneficiado (`anon`, `authenticated`). Elas são
-- a primeira limitação acima. Linha de `postgres`, ou com esquema `(todos)`, é um problema.
--
-- REVERSÃO (só se precisar voltar). Recoloca os padrões que o projeto tinha, e objetos novos voltam a nascer com
-- acesso total para `anon` e `authenticated`. Não muda objetos que já existem. Se a 005 já tiver sido executada,
-- isto desfaz também o item 5 dela.
--
-- INICIO DA REVERSAO
-- begin;
-- alter default privileges for role postgres in schema public grant all on tables to anon, authenticated;
-- alter default privileges for role postgres in schema public grant all on functions to anon, authenticated;
-- alter default privileges for role postgres in schema public grant all on sequences to anon, authenticated;
-- commit;
-- FIM DA REVERSAO

begin;

alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on functions from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;

commit;
