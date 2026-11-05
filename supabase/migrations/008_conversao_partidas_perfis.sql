-- Conversão de partidas e perfis: esporte e cidade deixam de ser texto livre, e as preferências de jogador
-- passam a ser guardadas no banco.
-- Executar manualmente no SQL Editor do Supabase, depois da 006 e da 007, e só com `partidas` vazia.
-- Passa ou falha por inteiro. Com `partidas` vazia, pode ser executada de novo sem erro.
--
-- O que faz:
-- 1. Aborta se `partidas` tiver alguma linha. Nada é apagado por conta própria.
-- 2. partidas: troca `esporte` e `cidade` (texto) por `esporte_id` e `cidade_id` (obrigatórios, com chave
--    estrangeira), limita `nivel` aos 3 ids de RATING_LEVELS e cria o índice de `cidade_id`. O de `data_hora` já
--    existe desde a 002. Não cria índice composto, porque o app filtra por data e faz o resto no cliente. As
--    policies e os privilégios de partidas não mudam.
-- 3. perfis: acrescenta `cidade_id` e `foto_url`, ambos opcionais, com UPDATE só nessas colunas.
-- 4. Cria `jogador_preferencias`. Os valores são ids estáveis, e o app traduz para o texto exibido em
--    src/constants/sport-preferences.ts:
--      dominante, em Futevôlei (pé): direito, esquerdo, ambos
--      dominante, nos outros esportes (mão): destra, canhota, ambidestra
--      lado: direita, esquerda, tanto-faz
--      horario: manha, tarde, noite, qualquer
--    Os três aceitam nulo, que o app mostra como "Não definido".
--
-- O que muda no app, junto com esta migration: partidas passam a gravar e ler `esporte_id` e `cidade_id`, com
-- nome e UF da cidade e nome do esporte vindos das tabelas; o nível grava o id; e a cidade e as preferências do
-- perfil passam a ser lidas e gravadas no banco. A versão anterior do app deixa de funcionar com estas colunas.
--
-- Limitações conhecidas:
-- - `foto_url` não tem validação: qualquer usuário logado pode gravar qualquer texto na própria linha. O app ainda
--   não lê essa coluna. Isso precisa de revisão quando o Storage de fotos entrar.
-- - O app não usa o DELETE de `jogador_preferencias`: ele existe porque foi pedido, e salvar usa INSERT e UPDATE.
-- - Depois desta migration, `delete from public.cidades` (a reversão da 007) é recusado se alguma partida usar a
--   cidade, e apaga `perfis.cidade_id` em silêncio nos perfis que a usam.
--
-- VERIFICAÇÃO, depois de executar. É um único comando porque o SQL Editor só mostra o resultado do último:
--
-- INICIO DA VERIFICACAO
-- select 'coluna ' || table_name::text || '.' || column_name::text as item,
--   data_type::text || ' | nulo=' || is_nullable::text as resultado
-- from information_schema.columns
-- where table_schema = 'public' and table_name in ('partidas', 'perfis', 'jogador_preferencias')
-- union all
-- select 'constraint ' || conrelid::regclass::text || ' ' || conname::text, pg_get_constraintdef(oid)
-- from pg_constraint
-- where conrelid in ('public.partidas'::regclass, 'public.perfis'::regclass, 'public.jogador_preferencias'::regclass)
--   and contype in ('c', 'f', 'p')
-- union all
-- select 'indice ' || indexname::text, indexdef
-- from pg_indexes
-- where schemaname = 'public' and tablename in ('partidas', 'jogador_preferencias')
-- union all
-- select 'rls ' || relname::text, relrowsecurity::text
-- from pg_class
-- where oid in ('public.partidas'::regclass, 'public.perfis'::regclass, 'public.jogador_preferencias'::regclass)
-- union all
-- select 'privilegio ' || table_name::text, grantee::text || ' ' || privilege_type::text
-- from information_schema.role_table_grants
-- where table_schema = 'public'
--   and table_name in ('partidas', 'perfis', 'jogador_preferencias')
--   and grantee in ('anon', 'authenticated', 'PUBLIC')
-- union all
-- select 'update por coluna perfis', grantee::text || ' ' || column_name::text
-- from information_schema.role_column_grants
-- where table_schema = 'public' and table_name = 'perfis' and privilege_type = 'UPDATE'
--   and grantee in ('anon', 'authenticated', 'PUBLIC')
-- union all
-- select 'policy ' || tablename::text || ' ' || cmd,
--   array_to_string(roles, ',') || ' | using ' || coalesce(qual, '-') || ' | check ' || coalesce(with_check, '-')
-- from pg_policies
-- where schemaname = 'public' and tablename = 'jogador_preferencias'
-- order by 1, 2;
-- FIM DA VERIFICACAO
--
-- Esperado, 56 linhas, nesta ordem. A formatação do texto dos constraints pode variar entre versões do Postgres; o
-- que importa são as colunas e os valores:
--   coluna jogador_preferencias.dominante = text | nulo=YES
--   coluna jogador_preferencias.esporte_id = text | nulo=NO
--   coluna jogador_preferencias.horario = text | nulo=YES
--   coluna jogador_preferencias.lado = text | nulo=YES
--   coluna jogador_preferencias.user_id = uuid | nulo=NO
--   coluna partidas.cidade_id = integer | nulo=NO
--   coluna partidas.criado_em = timestamp with time zone | nulo=NO
--   coluna partidas.criador_id = uuid | nulo=YES
--   coluna partidas.data_hora = timestamp with time zone | nulo=NO
--   coluna partidas.esporte_id = text | nulo=NO
--   coluna partidas.id = uuid | nulo=NO
--   coluna partidas.local = text | nulo=NO
--   coluna partidas.nivel = text | nulo=NO
--   coluna partidas.vagas = integer | nulo=NO
--   coluna perfis.cidade_id = integer | nulo=YES
--   coluna perfis.criado_em = timestamp with time zone | nulo=NO
--   coluna perfis.foto_url = text | nulo=YES
--   coluna perfis.id = uuid | nulo=NO
--   coluna perfis.nome_exibicao = text | nulo=NO
--   constraint jogador_preferencias jogador_preferencias_dominante_check = CHECK (((dominante IS NULL) OR ((esporte_id = 'futevolei'::text) AND (dominante = ANY (ARRAY['direito'::text, 'esquerdo'::text, 'ambos'::text]))) OR ((esporte_id <> 'futevolei'::text) AND (dominante = ANY (ARRAY['destra'::text, 'canhota'::text, 'ambidestra'::text])))))
--   constraint jogador_preferencias jogador_preferencias_esporte_id_fkey = FOREIGN KEY (esporte_id) REFERENCES esportes(id)
--   constraint jogador_preferencias jogador_preferencias_horario_check = CHECK ((horario = ANY (ARRAY['manha'::text, 'tarde'::text, 'noite'::text, 'qualquer'::text])))
--   constraint jogador_preferencias jogador_preferencias_lado_check = CHECK ((lado = ANY (ARRAY['direita'::text, 'esquerda'::text, 'tanto-faz'::text])))
--   constraint jogador_preferencias jogador_preferencias_pkey = PRIMARY KEY (user_id, esporte_id)
--   constraint jogador_preferencias jogador_preferencias_user_id_fkey = FOREIGN KEY (user_id) REFERENCES perfis(id) ON DELETE CASCADE
--   constraint partidas partidas_cidade_id_fkey = FOREIGN KEY (cidade_id) REFERENCES cidades(id)
--   constraint partidas partidas_criador_id_fkey = FOREIGN KEY (criador_id) REFERENCES auth.users(id) ON DELETE SET NULL
--   constraint partidas partidas_esporte_id_fkey = FOREIGN KEY (esporte_id) REFERENCES esportes(id)
--   constraint partidas partidas_nivel_check = CHECK ((nivel = ANY (ARRAY['iniciante'::text, 'intermediario'::text, 'avancado'::text])))
--   constraint partidas partidas_pkey = PRIMARY KEY (id)
--   constraint partidas partidas_vagas_check = CHECK (((vagas >= 1) AND (vagas <= 20)))
--   constraint perfis perfis_cidade_id_fkey = FOREIGN KEY (cidade_id) REFERENCES cidades(id) ON DELETE SET NULL
--   constraint perfis perfis_id_fkey = FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
--   constraint perfis perfis_pkey = PRIMARY KEY (id)
--   indice jogador_preferencias_pkey = CREATE UNIQUE INDEX jogador_preferencias_pkey ON public.jogador_preferencias USING btree (user_id, esporte_id)
--   indice partidas_cidade_id_idx = CREATE INDEX partidas_cidade_id_idx ON public.partidas USING btree (cidade_id)
--   indice partidas_data_hora_idx = CREATE INDEX partidas_data_hora_idx ON public.partidas USING btree (data_hora)
--   indice partidas_pkey = CREATE UNIQUE INDEX partidas_pkey ON public.partidas USING btree (id)
--   policy jogador_preferencias DELETE = authenticated | using (user_id = auth.uid()) | check -
--   policy jogador_preferencias INSERT = authenticated | using - | check (user_id = auth.uid())
--   policy jogador_preferencias SELECT = authenticated | using true | check -
--   policy jogador_preferencias UPDATE = authenticated | using (user_id = auth.uid()) | check (user_id = auth.uid())
--   privilegio jogador_preferencias = authenticated DELETE
--   privilegio jogador_preferencias = authenticated INSERT
--   privilegio jogador_preferencias = authenticated SELECT
--   privilegio jogador_preferencias = authenticated UPDATE
--   privilegio partidas = authenticated DELETE
--   privilegio partidas = authenticated INSERT
--   privilegio partidas = authenticated SELECT
--   privilegio perfis = authenticated SELECT
--   rls jogador_preferencias = true
--   rls partidas = true
--   rls perfis = true
--   update por coluna perfis = authenticated cidade_id
--   update por coluna perfis = authenticated foto_url
--   update por coluna perfis = authenticated nome_exibicao
-- Qualquer linha com `anon` ou `PUBLIC`, ou `UPDATE` em "privilegio perfis" ou "privilegio partidas", é um problema.
-- `service_role` não entra na consulta: não é alterado aqui e não é usado no app.
--
-- REVERSÃO (só se precisar voltar, e junto com a versão anterior do app). Devolve as colunas de texto e apaga as
-- preferências e as cidades dos perfis. Falha se `partidas` tiver linhas, porque as colunas devolvidas são
-- obrigatórias: nesse caso, apague essas partidas antes.
--
-- INICIO DA REVERSAO
-- begin;
-- drop table if exists public.jogador_preferencias;
-- alter table public.perfis
--   drop column if exists foto_url,
--   drop column if exists cidade_id;
-- alter table public.partidas drop constraint if exists partidas_nivel_check;
-- alter table public.partidas
--   add column if not exists esporte text not null,
--   add column if not exists cidade text not null,
--   drop column if exists esporte_id,
--   drop column if exists cidade_id;
-- commit;
-- FIM DA REVERSAO

begin;

-- 1. Com linhas em `partidas`, as colunas obrigatórias não teriam o que guardar.
do $$
begin
  if exists (select 1 from public.partidas) then
    raise exception 'public.partidas não está vazia. Apague as partidas de teste antes de executar a 008: delete from public.partidas;';
  end if;
end;
$$;

-- 2. partidas
alter table public.partidas
  add column if not exists esporte_id text not null references public.esportes (id),
  add column if not exists cidade_id integer not null references public.cidades (id),
  drop column if exists esporte,
  drop column if exists cidade;

alter table public.partidas drop constraint if exists partidas_nivel_check;
alter table public.partidas
  add constraint partidas_nivel_check check (nivel in ('iniciante', 'intermediario', 'avancado'));

-- A listagem ordena por data; a cidade prepara o filtro e serve à chave estrangeira.
create index if not exists partidas_data_hora_idx on public.partidas (data_hora);
create index if not exists partidas_cidade_id_idx on public.partidas (cidade_id);

-- 3. perfis. O SELECT da tabela já cobre as colunas novas, e o UPDATE continua sendo só por coluna.
alter table public.perfis
  add column if not exists cidade_id integer references public.cidades (id) on delete set null,
  add column if not exists foto_url text;

grant update (cidade_id, foto_url) on public.perfis to authenticated;

-- 4. jogador_preferencias
create table if not exists public.jogador_preferencias (
  user_id uuid not null default auth.uid() references public.perfis (id) on delete cascade,
  esporte_id text not null references public.esportes (id),
  dominante text,
  lado text constraint jogador_preferencias_lado_check check (lado in ('direita', 'esquerda', 'tanto-faz')),
  horario text constraint jogador_preferencias_horario_check check (horario in ('manha', 'tarde', 'noite', 'qualquer')),
  primary key (user_id, esporte_id),
  -- Futevôlei é jogado com os pés; os outros esportes, com as mãos. Como em SPORT_PREFERENCES.
  constraint jogador_preferencias_dominante_check check (
    dominante is null
    or (esporte_id = 'futevolei' and dominante in ('direito', 'esquerdo', 'ambos'))
    or (esporte_id <> 'futevolei' and dominante in ('destra', 'canhota', 'ambidestra'))
  )
);

alter table public.jogador_preferencias enable row level security;

drop policy if exists "Usuários logados veem as preferências" on public.jogador_preferencias;
create policy "Usuários logados veem as preferências"
  on public.jogador_preferencias for select
  to authenticated
  using (true);

drop policy if exists "Usuário cria as próprias preferências" on public.jogador_preferencias;
create policy "Usuário cria as próprias preferências"
  on public.jogador_preferencias for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Usuário altera as próprias preferências" on public.jogador_preferencias;
create policy "Usuário altera as próprias preferências"
  on public.jogador_preferencias for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Usuário apaga as próprias preferências" on public.jogador_preferencias;
create policy "Usuário apaga as próprias preferências"
  on public.jogador_preferencias for delete
  to authenticated
  using (user_id = auth.uid());

-- Os privilégios padrão do Supabase não são confiáveis: veja docs/modelo-de-dados.md.
revoke all on public.jogador_preferencias from anon, authenticated;
grant select, insert, update, delete on public.jogador_preferencias to authenticated;

commit;
