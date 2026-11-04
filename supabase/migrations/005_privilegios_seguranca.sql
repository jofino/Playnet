-- Privilégios e segurança das tabelas da 002 e da 003: partidas, partida_participantes, perfis e seguidores.
-- Executar manualmente no SQL Editor do Supabase, depois da 002, da 003 e da 004. Passa ou falha por
-- inteiro, e pode ser executada de novo sem erro. As tabelas da 004 não são tocadas.
--
-- O que faz:
-- 1. Deixa em `authenticated` só o que o app usa hoje, e nada em `anon`. INSERT e DELETE de partidas e
--    participantes continuam até a etapa 2, junto com a mudança do app.
-- 2. Retira o UPDATE de partidas e a policy dele, e aborta se as policies de INSERT e DELETE não forem
--    restritas ao criador.
-- 3. Torna partidas.criador_id anulável, com `on delete set null`: apagar uma conta não apaga mais as
--    partidas que ela criou.
-- 4. Garante que a função do trigger de perfis não é chamável pelo app e tem search_path fixo.
-- 5. Faz com que tabelas e funções futuras em `public` não nasçam com privilégios para `anon` e
--    `authenticated`.
--
-- Com criador_id nulo, as policies continuam corretas: SELECT mostra a partida; INSERT é recusado, porque
-- a condição não é verdadeira; DELETE não alcança a partida, e ninguém a apaga pelo app.
--
-- Limitações conhecidas:
-- - Privilégios padrão (item 5): este arquivo foi escrito sem acesso ao banco, então o bloco lê
--   pg_default_acl ao executar. Em projetos Supabase é comum haver entradas de `postgres` e de
--   `supabase_admin` concedendo tudo a `anon` e `authenticated`, mas isso NÃO foi confirmado neste projeto.
--   Só são alterados os roles que o usuário atual pode alterar; os outros, como `supabase_admin` em geral,
--   são pulados, porque tentar derrubaria a transação. A consulta 3 mostra o que sobrou.
-- - Funções novas continuam executáveis por PUBLIC, o que inclui `anon`. Esse padrão é global do Postgres,
--   e `alter default privileges ... in schema` não consegue retirá-lo. A versão global afetaria todos os
--   esquemas e as extensões instaladas depois, então não é feita aqui. Cada função nova revoga o próprio
--   EXECUTE, como manda docs/modelo-de-dados.md.
-- - Tabelas criadas depois disto, inclusive pelo Table Editor, ficam inacessíveis ao app até receberem
--   GRANT explícito. Sequências não são alteradas.
--
-- ANTES DE EXECUTAR: rode as consultas 1 e 3 e guarde o resultado. Se o projeto usava os privilégios
-- padrão, o estado atual pode ser mais amplo do que o escrito na 002 e na 003, e o bloco de reversão
-- volta para o que está escrito nelas.
--
-- VERIFICAÇÃO, depois de executar:
--
-- Consulta 1, privilégios de tabela:
--   select table_name, grantee, privilege_type
--   from information_schema.role_table_grants
--   where table_schema = 'public'
--     and table_name in ('partidas', 'partida_participantes', 'perfis', 'seguidores')
--     and grantee in ('anon', 'authenticated')
--   order by 1, 2, 3;
-- Esperado, 10 linhas, todas de `authenticated` e nenhuma de `anon`:
--   partida_participantes: DELETE, INSERT, SELECT
--   partidas:              DELETE, INSERT, SELECT
--   perfis:                SELECT
--   seguidores:            DELETE, INSERT, SELECT
--
-- O UPDATE de perfis é por coluna e não aparece nessa visão. Para conferi-lo:
--   select grantee, column_name
--   from information_schema.role_column_grants
--   where table_schema = 'public' and table_name = 'perfis' and privilege_type = 'UPDATE'
--     and grantee in ('anon', 'authenticated');
-- Esperado, 1 linha: authenticated, nome_exibicao.
--
-- Consulta 2, policies:
--   select tablename, cmd, policyname, qual, with_check
--   from pg_policies
--   where schemaname = 'public'
--     and tablename in ('partidas', 'partida_participantes', 'perfis', 'seguidores')
--   order by 1, 2;
-- Esperado, 11 linhas:
--   partida_participantes: DELETE (user_id = auth.uid()), INSERT (user_id = auth.uid()), SELECT (true)
--   partidas:              DELETE (criador_id = auth.uid()), INSERT (criador_id = auth.uid()), SELECT (true)
--   perfis:                SELECT (true), UPDATE (id = auth.uid())
--   seguidores:            DELETE (seguidor_id = auth.uid()), INSERT (seguidor_id = auth.uid()), SELECT (true)
-- partidas não deve ter nenhuma linha de UPDATE.
--
-- Consulta 3, privilégios padrão em `public`:
--   select r.rolname as dono, d.defaclobjtype as tipo, d.defaclacl
--   from pg_default_acl d
--   join pg_roles r on r.oid = d.defaclrole
--   where d.defaclnamespace = 'public'::regnamespace
--   order by 1, 2;
-- Esperado: `anon` e `authenticated` não aparecem em defaclacl nas linhas de tipo r (tabelas) e f (funções)
-- dos roles alterados. Linhas de `supabase_admin` podem continuar com eles, se o bloco as tiver pulado.
--
-- REVERSÃO (só se precisar voltar). Volta ao que está escrito na 002 e na 003. A troca da chave falha se já
-- houver partida com criador_id nulo: nesse caso, apague essas partidas antes. A chave mantém o nome que
-- tinha; confira com a consulta em pg_constraint se o nome abaixo não for encontrado. Os dois comandos de
-- privilégios padrão só valem se a consulta 3, feita antes de executar, mostrava essas entradas.
--
-- INICIO DA REVERSAO
-- begin;
-- revoke all on public.perfis, public.seguidores, public.partidas, public.partida_participantes from anon, authenticated;
-- grant select, update on public.perfis to authenticated;
-- grant select, insert, delete on public.seguidores to authenticated;
-- grant select, insert, update, delete on public.partidas to authenticated;
-- grant select, insert, delete on public.partida_participantes to authenticated;
-- drop policy if exists "Criador atualiza a própria partida" on public.partidas;
-- create policy "Criador atualiza a própria partida"
--   on public.partidas for update
--   to authenticated
--   using (criador_id = auth.uid())
--   with check (criador_id = auth.uid());
-- alter table public.partidas drop constraint if exists partidas_criador_id_fkey;
-- alter table public.partidas alter column criador_id set not null;
-- alter table public.partidas
--   add constraint partidas_criador_id_fkey foreign key (criador_id) references auth.users (id) on delete cascade;
-- alter default privileges for role postgres in schema public grant all on tables to anon, authenticated;
-- alter default privileges for role postgres in schema public grant all on functions to anon, authenticated;
-- commit;
-- FIM DA REVERSAO

begin;

-- 1. Privilégios. O revoke retira também os privilégios por coluna.
revoke all on public.perfis, public.seguidores, public.partidas, public.partida_participantes
  from anon, authenticated;

grant select on public.perfis to authenticated;
grant update (nome_exibicao) on public.perfis to authenticated;
grant select, insert, delete on public.seguidores to authenticated;
grant select, insert, delete on public.partidas to authenticated;
grant select, insert, delete on public.partida_participantes to authenticated;

-- 2. O app não altera partidas; sem o privilégio, a policy seria uma regra morta.
drop policy if exists "Criador atualiza a própria partida" on public.partidas;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'partidas' and cmd in ('UPDATE', 'ALL')
  ) then
    raise exception 'partidas ainda tem policy de UPDATE ou ALL; revise antes de continuar.';
  end if;

  if (
    select count(*) filter (where with_check = '(criador_id = auth.uid())') = 1 and count(*) = 1
    from pg_policies
    where schemaname = 'public' and tablename = 'partidas' and cmd = 'INSERT'
  ) is not true then
    raise exception 'A policy de INSERT de partidas não é exatamente criador_id = auth.uid().';
  end if;

  if (
    select count(*) filter (where qual = '(criador_id = auth.uid())') = 1 and count(*) = 1
    from pg_policies
    where schemaname = 'public' and tablename = 'partidas' and cmd = 'DELETE'
  ) is not true then
    raise exception 'A policy de DELETE de partidas não é exatamente criador_id = auth.uid().';
  end if;
end;
$$;

-- 3. O nome da chave vem do catálogo, e ela só é trocada se ainda não estiver como `set null`.
alter table public.partidas alter column criador_id drop not null;

do $$
declare
  chave record;
begin
  select c.conname, c.confdeltype
  into chave
  from pg_constraint c
  join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
  where c.conrelid = 'public.partidas'::regclass
    and c.contype = 'f'
    and c.confrelid = 'auth.users'::regclass
    and array_length(c.conkey, 1) = 1
    and a.attname = 'criador_id';

  if not found then
    raise exception 'Chave estrangeira de partidas.criador_id para auth.users não encontrada.';
  end if;

  if chave.confdeltype <> 'n' then
    execute format('alter table public.partidas drop constraint %I', chave.conname);
    execute format(
      'alter table public.partidas add constraint %I foreign key (criador_id) references auth.users (id) on delete set null',
      chave.conname
    );
  end if;
end;
$$;

-- 4. Quem dispara o trigger é o serviço de autenticação, e o Postgres só confere EXECUTE ao criar o trigger.
revoke execute on function public.criar_perfil_do_novo_usuario() from public, anon, authenticated;

do $$
declare
  funcao record;
begin
  select p.prosecdef, p.proconfig
  into funcao
  from pg_proc p
  where p.oid = 'public.criar_perfil_do_novo_usuario()'::regprocedure;

  if funcao.prosecdef and not exists (
    select 1 from unnest(funcao.proconfig) as ajuste where ajuste like 'search_path=%'
  ) then
    alter function public.criar_perfil_do_novo_usuario() set search_path = '';
  end if;
end;
$$;

-- 5. Só alteramos as entradas em `public` que dão acesso a `anon` ou `authenticated`, e só nos roles
-- permitidos. `service_role` não é tocado. Veja as limitações no topo do arquivo.
do $$
declare
  entrada record;
begin
  for entrada in
    select distinct
      r.rolname,
      case d.defaclobjtype when 'r' then 'tables' else 'functions' end as objetos
    from pg_default_acl d
    join pg_roles r on r.oid = d.defaclrole
    cross join lateral aclexplode(d.defaclacl) as acl
    join pg_roles beneficiado on beneficiado.oid = acl.grantee
    where d.defaclnamespace = 'public'::regnamespace
      and d.defaclobjtype in ('r', 'f')
      and beneficiado.rolname in ('anon', 'authenticated')
  loop
    if pg_has_role(current_user, entrada.rolname, 'USAGE') then
      execute format(
        'alter default privileges for role %I in schema public revoke all on %s from anon, authenticated',
        entrada.rolname,
        entrada.objetos
      );
    else
      raise notice 'Privilégios padrão de % (%) não alterados: sem permissão.', entrada.rolname, entrada.objetos;
    end if;
  end loop;
end;
$$;

commit;
