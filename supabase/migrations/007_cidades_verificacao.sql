-- Verificação da carga da 007. Só leitura: não grava nada. Executar depois das três partes.
-- Gerado por scripts/gerar-cidades.mjs. Não edite à mão: rode o script de novo.
-- É um único comando porque o SQL Editor do Supabase só mostra o resultado do último.
--
-- Fonte dos valores esperados: API de localidades do IBGE (https://servicodados.ibge.gov.br/api/v1/localidades),
-- baixada em 2026-11-04.
--
-- Regra de `nome_busca`. O seletor de cidade do app precisa normalizar o termo digitado exatamente assim:
--   nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ')
-- Ou seja: minúsculas; sem acentos (NFD, removendo as marcas combinantes U+0300 a U+036F); sem espaços nas
-- pontas; espaços repetidos viram um só. Hífens e apóstrofos são mantidos.
--
-- Esperado, 46 linhas, em ordem:
-- 1 total: 5571
-- 2 ufs distintas: 27
-- 3 uf, a contagem de cada uma:
--   AC 22, AL 102, AM 62, AP 16, BA 417, CE 184, DF 1, ES 78, GO 246
--   MA 217, MG 853, MS 79, MT 142, PA 144, PB 223, PE 185, PI 224, PR 399
--   RJ 92, RN 167, RO 52, RR 15, RS 497, SC 295, SE 75, SP 645, TO 139
-- 4 nome_busca divergente: total 0, e nenhuma linha de município. A consulta refaz a regra com translate(), que
--   cobre os 17 caracteres acentuados devolvidos pela API, sem depender da extensão unaccent.
-- 5 controle, 6 linhas:
--   3304557 Rio de Janeiro | RJ | rio de janeiro
--   3509502 Campinas | SP | campinas
--   3543402 Ribeirão Preto | SP | ribeirao preto
--   3548906 São Carlos | SP | sao carlos
--   3550308 São Paulo | SP | sao paulo
--   5300108 Brasília | DF | brasilia
-- 6 prefixo 'sao c': total 8, e estes municípios:
--   1507102 São Caetano de Odivelas | PA
--   2613107 São Caitano | PE
--   2806701 São Cristóvão | SE
--   3548807 São Caetano do Sul | SP
--   3548906 São Carlos | SP
--   4124608 São Carlos do Ivaí | PR
--   4216008 São Carlos | SC
--   4216057 São Cristóvão do Sul | SC
-- 7 indice: a definição de cidades_nome_busca_idx, com text_pattern_ops.
--
-- Divergências entre os municípios de controle e a API: nenhuma.
--
-- EXPLAIN, em um comando à parte. O Postgres não aceita EXPLAIN dentro de um SELECT sem criar uma função, e este
-- arquivo é só leitura. Execute só a linha abaixo, sem o `--`:
-- INICIO DO EXPLAIN
-- explain select * from public.cidades where nome_busca like 'sao c%';
-- FIM DO EXPLAIN
-- Esperado: `Index Scan` ou `Bitmap Index Scan` em cidades_nome_busca_idx. Com poucos registros, o planejador pode
-- preferir varredura sequencial (`Seq Scan`), que nesse caso é mais barata e não indica problema.

with conferencia as (
  select id, nome, nome_busca,
    lower(btrim(regexp_replace(translate(nome, 'ÁÂÉÍÓáâãçéêíóôõúü', 'AAEIOaaaceeiooouu'), '\s+', ' ', 'g'))) as esperado
  from public.cidades
)
select '1 total' as item, count(*)::text as resultado from public.cidades
union all
select '2 ufs distintas', count(distinct uf)::text from public.cidades
union all
select '3 uf ' || uf, count(*)::text from public.cidades group by uf
union all
select '4 nome_busca divergente: total', count(*)::text from conferencia where nome_busca <> esperado
union all
select '4 nome_busca divergente: ' || id, nome || ' | ' || nome_busca from conferencia where nome_busca <> esperado
union all
select '5 controle ' || id, nome || ' | ' || uf || ' | ' || nome_busca
from public.cidades
where id in (3304557, 3509502, 3543402, 3548906, 3550308, 5300108)
union all
select '6 prefixo sao c: total', count(*)::text from public.cidades where nome_busca like 'sao c%'
union all
select '6 prefixo sao c: ' || id, nome || ' | ' || uf from public.cidades where nome_busca like 'sao c%'
union all
select '7 indice', indexdef from pg_indexes where schemaname = 'public' and indexname = 'cidades_nome_busca_idx'
order by 1, 2;
