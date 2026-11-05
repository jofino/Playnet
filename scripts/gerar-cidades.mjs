#!/usr/bin/env node

/**
 * Gera a carga da migration 007 (cidades) a partir da API de localidades do IBGE.
 *
 * Uso: node scripts/gerar-cidades.mjs [pasta fora do repositório para a resposta bruta da API]
 *
 * Pode ser executado de novo: sobrescreve os arquivos gerados. Se a API falhar ou alguma validação
 * não passar, nenhum arquivo SQL é gravado.
 */

import { Buffer } from 'node:buffer';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://servicodados.ibge.gov.br/api/v1/localidades';
const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS = join(RAIZ, 'supabase', 'migrations');

const PARTES = 3;
const TAMANHO_DO_LOTE = 500;
const TOTAL_ESPERADO = 5570;
const TOLERANCIA_DO_TOTAL = 50;
const TOTAL_DE_UFS = 27;
const PREFIXO_DE_TESTE = 'sao c';

// Só referência para comparar com a API. Os dados gravados vêm sempre da API.
const CONTROLES = [
  { id: 3550308, nome: 'São Paulo', uf: 'SP' },
  { id: 3509502, nome: 'Campinas', uf: 'SP' },
  { id: 3304557, nome: 'Rio de Janeiro', uf: 'RJ' },
  { id: 5300108, nome: 'Brasília', uf: 'DF' },
  { id: 3548906, nome: 'São Carlos', uf: 'SP' },
  { id: 3543402, nome: 'Ribeirão Preto', uf: 'SP' },
];

const removerAcentos = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** O seletor de cidade do app precisa normalizar o termo digitado exatamente assim. */
const normalizarBusca = (nome) => removerAcentos(nome.toLowerCase()).trim().replace(/\s+/g, ' ');

const REGRA_DA_BUSCA = `-- Regra de \`nome_busca\`. O seletor de cidade do app precisa normalizar o termo digitado exatamente assim:
--   nome.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim().replace(/\\s+/g, ' ')
-- Ou seja: minúsculas; sem acentos (NFD, removendo as marcas combinantes U+0300 a U+036F); sem espaços nas
-- pontas; espaços repetidos viram um só. Hífens e apóstrofos são mantidos.`;

const literal = (texto) => `'${texto.replaceAll("'", "''")}'`;

async function baixar(caminho) {
  const url = `${API}/${caminho}`;
  const resposta = await fetch(url, { signal: AbortSignal.timeout(120_000) });
  if (!resposta.ok) throw new Error(`A API do IBGE respondeu ${resposta.status} em ${url}.`);
  const bruto = await resposta.text();
  const dados = JSON.parse(bruto);
  if (!Array.isArray(dados)) throw new Error(`A API do IBGE não devolveu uma lista em ${url}.`);
  return { bruto, dados };
}

function pastaDeAuditoria() {
  const pasta = resolve(process.argv[2] ?? join(tmpdir(), 'playnet-ibge'));
  const caminho = relative(RAIZ, pasta);
  if (!caminho.startsWith('..') && !isAbsolute(caminho)) {
    throw new Error(`A resposta bruta da API não pode ficar dentro do repositório: ${pasta}`);
  }
  return pasta;
}

function montarMapaDeUfs(estados) {
  const erros = [];
  const ufs = new Map();
  for (const estado of estados) {
    if (!Number.isInteger(estado.id) || !/^[A-Z]{2}$/.test(estado.sigla ?? '')) {
      erros.push(`Estado inválido: ${JSON.stringify({ id: estado.id, sigla: estado.sigla })}`);
    } else if (ufs.has(estado.id) || [...ufs.values()].includes(estado.sigla)) {
      erros.push(`Estado repetido: ${estado.id} ${estado.sigla}`);
    } else {
      ufs.set(estado.id, estado.sigla);
    }
  }
  if (ufs.size !== TOTAL_DE_UFS) erros.push(`Esperava ${TOTAL_DE_UFS} UFs, e a API devolveu ${ufs.size}.`);
  return { ufs, erros };
}

function montarCidades(municipios, ufs) {
  const erros = [];
  const ids = new Set();
  const cidades = [];
  for (const municipio of municipios) {
    const { id, nome } = municipio;
    const rotulo = JSON.stringify({ id, nome });
    if (!Number.isInteger(id) || !/^\d{7}$/.test(String(id))) {
      erros.push(`Id inválido: ${rotulo}`);
      continue;
    }
    if (ids.has(id)) erros.push(`Id repetido: ${rotulo}`);
    ids.add(id);
    if (typeof nome !== 'string' || nome.trim() === '') {
      erros.push(`Nome vazio: ${rotulo}`);
      continue;
    }
    // Pelos 2 primeiros dígitos: os campos aninhados podem faltar em alguns municípios.
    const uf = ufs.get(Math.floor(id / 100_000));
    if (!uf || !/^[A-Z]{2}$/.test(uf)) erros.push(`UF não encontrada: ${rotulo}`);
    const nomeBusca = normalizarBusca(nome);
    if (nomeBusca === '') erros.push(`nome_busca vazio: ${rotulo}`);
    // Um caractere fora do ASCII aqui é algo que a regra não previu, como um apóstrofo tipográfico.
    if (!/^[\x20-\x7e]*$/.test(nomeBusca)) erros.push(`nome_busca fora do ASCII: ${rotulo} -> ${nomeBusca}`);
    cidades.push({ id, nome, uf, nomeBusca });
  }
  cidades.sort((a, b) => a.id - b.id);
  if (Math.abs(municipios.length - TOTAL_ESPERADO) > TOLERANCIA_DO_TOTAL) {
    erros.push(`Total fora do esperado: ${municipios.length} (perto de ${TOTAL_ESPERADO}).`);
  }
  const semMunicipio = [...ufs.values()].filter((uf) => !cidades.some((cidade) => cidade.uf === uf));
  if (semMunicipio.length > 0) erros.push(`UFs sem município: ${semMunicipio.join(', ')}`);
  return { cidades, erros };
}

/** Listas do translate() da verificação, com todos os caracteres acentuados que a API devolveu. */
function montarTraducao(cidades) {
  const erros = [];
  const pares = new Map();
  for (const { nome } of cidades) {
    for (const caractere of nome) {
      if (caractere.codePointAt(0) <= 0x7e || pares.has(caractere)) continue;
      const base = removerAcentos(caractere);
      if (!/^[\x20-\x7e]$/.test(base)) erros.push(`Caractere sem equivalente simples: ${caractere} em ${nome}`);
      pares.set(caractere, base);
    }
  }
  const ordenados = [...pares.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  const origem = ordenados.map(([caractere]) => caractere).join('');
  const destino = ordenados.map(([, base]) => base).join('');
  for (const { nome, nomeBusca } of cidades) {
    const traduzido = [...nome].map((caractere) => pares.get(caractere) ?? caractere).join('');
    if (traduzido.toLowerCase().trim().replace(/\s+/g, ' ') !== nomeBusca) {
      erros.push(`A conferência em SQL não reproduziria nome_busca: ${nome} -> ${nomeBusca}`);
    }
  }
  return { origem, destino, erros };
}

function compararControles(cidades) {
  const divergencias = [];
  for (const controle of CONTROLES) {
    const cidade = cidades.find(({ id }) => id === controle.id);
    if (!cidade) {
      divergencias.push(`${controle.id} (${controle.nome} ${controle.uf}): não veio da API.`);
    } else if (cidade.nome !== controle.nome || cidade.uf !== controle.uf) {
      divergencias.push(`${controle.id}: referência ${controle.nome} ${controle.uf}, API ${cidade.nome} ${cidade.uf}.`);
    }
  }
  return divergencias;
}

function dividirEmPartes(cidades) {
  return Array.from({ length: PARTES }, (_, indice) =>
    cidades.slice(Math.round((cidades.length * indice) / PARTES), Math.round((cidades.length * (indice + 1)) / PARTES)),
  );
}

function gerarLote(lote) {
  const linhas = lote.map(
    ({ id, nome, uf, nomeBusca }) => `  (${id}, ${literal(nome)}, ${literal(uf)}, ${literal(nomeBusca)})`,
  );
  return `insert into public.cidades (id, nome, uf, nome_busca) values
${linhas.join(',\n')}
on conflict (id) do update set nome = excluded.nome, uf = excluded.uf, nome_busca = excluded.nome_busca;`;
}

function gerarParte(parte, numero, dataDaCarga) {
  const lotes = [];
  for (let inicio = 0; inicio < parte.length; inicio += TAMANHO_DO_LOTE) {
    lotes.push(parte.slice(inicio, inicio + TAMANHO_DO_LOTE));
  }
  return `-- Carga dos municípios do IBGE na tabela \`cidades\`, criada pela 006: parte ${numero} de ${PARTES}.
-- Gerado por scripts/gerar-cidades.mjs. Não edite à mão: rode o script de novo.
-- Executar manualmente no SQL Editor do Supabase, depois da 006. Ordem: parte1, parte2, parte3 e, por fim,
-- 007_cidades_verificacao.sql.
--
-- Fonte: API de localidades do IBGE (${API}), baixada em ${dataDaCarga}.
-- A UF vem dos 2 primeiros dígitos do código do município, pelo mapa de /estados.
--
-- O que faz: grava ${parte.length} municípios (ids ${parte[0].id} a ${parte.at(-1).id}), em ${lotes.length} lotes. Só grava dados:
-- não altera a estrutura, os índices, os privilégios nem as policies da 006. Passa ou falha por inteiro.
-- Pode ser executada de novo sem duplicar: um id que já exista é atualizado com os valores deste arquivo.
--
${REGRA_DA_BUSCA}
--
-- REVERSÃO (só antes da 008, enquanto nenhuma tabela referenciar \`cidades\`). Apaga todos os municípios, não só
-- os desta parte. Esta consulta precisa voltar vazia, porque uma chave com \`on delete set null\` não recusaria o
-- delete, e sim apagaria a cidade das linhas que a usam:
--   select conrelid::regclass as tabela, conname as chave
--   from pg_constraint
--   where confrelid = 'public.cidades'::regclass;
-- Depois:
--   delete from public.cidades;

begin;

${lotes.map(gerarLote).join('\n\n')}

commit;
`;
}

function gerarVerificacao(cidades, traducao, divergencias, dataDaCarga) {
  const contagemPorUf = new Map();
  for (const { uf } of cidades) contagemPorUf.set(uf, (contagemPorUf.get(uf) ?? 0) + 1);
  const ufsOrdenadas = [...contagemPorUf.entries()].sort(([a], [b]) => (a < b ? -1 : 1));
  const linhasPorUf = [];
  for (let inicio = 0; inicio < ufsOrdenadas.length; inicio += 9) {
    const trecho = ufsOrdenadas.slice(inicio, inicio + 9);
    linhasPorUf.push(`--   ${trecho.map(([uf, total]) => `${uf} ${total}`).join(', ')}`);
  }

  const idsDeControle = CONTROLES.map(({ id }) => id).sort((a, b) => a - b);
  const controles = cidades.filter(({ id }) => idsDeControle.includes(id));
  const noPrefixo = cidades.filter(({ nomeBusca }) => nomeBusca.startsWith(PREFIXO_DE_TESTE));
  const totalDeLinhas = 2 + contagemPorUf.size + 1 + controles.length + 1 + noPrefixo.length + 1;

  return `-- Verificação da carga da 007. Só leitura: não grava nada. Executar depois das três partes.
-- Gerado por scripts/gerar-cidades.mjs. Não edite à mão: rode o script de novo.
-- É um único comando porque o SQL Editor do Supabase só mostra o resultado do último.
--
-- Fonte dos valores esperados: API de localidades do IBGE (${API}),
-- baixada em ${dataDaCarga}.
--
${REGRA_DA_BUSCA}
--
-- Esperado, ${totalDeLinhas} linhas, em ordem:
-- 1 total: ${cidades.length}
-- 2 ufs distintas: ${contagemPorUf.size}
-- 3 uf, a contagem de cada uma:
${linhasPorUf.join('\n')}
-- 4 nome_busca divergente: total 0, e nenhuma linha de município. A consulta refaz a regra com translate(), que
--   cobre os ${[...traducao.origem].length} caracteres acentuados devolvidos pela API, sem depender da extensão unaccent.
-- 5 controle, ${controles.length} linhas:
${controles.map(({ id, nome, uf, nomeBusca }) => `--   ${id} ${nome} | ${uf} | ${nomeBusca}`).join('\n')}
-- 6 prefixo '${PREFIXO_DE_TESTE}': total ${noPrefixo.length}, e estes municípios:
${noPrefixo.map(({ id, nome, uf }) => `--   ${id} ${nome} | ${uf}`).join('\n')}
-- 7 indice: a definição de cidades_nome_busca_idx, com text_pattern_ops.
--
-- Divergências entre os municípios de controle e a API: ${divergencias.length === 0 ? 'nenhuma.' : divergencias.join(' ')}
--
-- EXPLAIN, em um comando à parte. O Postgres não aceita EXPLAIN dentro de um SELECT sem criar uma função, e este
-- arquivo é só leitura. Execute só a linha abaixo, sem o \`--\`:
-- INICIO DO EXPLAIN
-- explain select * from public.cidades where nome_busca like '${PREFIXO_DE_TESTE}%';
-- FIM DO EXPLAIN
-- Esperado: \`Index Scan\` ou \`Bitmap Index Scan\` em cidades_nome_busca_idx. Com poucos registros, o planejador pode
-- preferir varredura sequencial (\`Seq Scan\`), que nesse caso é mais barata e não indica problema.

with conferencia as (
  select id, nome, nome_busca,
    lower(btrim(regexp_replace(translate(nome, ${literal(traducao.origem)}, ${literal(traducao.destino)}), '\\s+', ' ', 'g'))) as esperado
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
where id in (${idsDeControle.join(', ')})
union all
select '6 prefixo ${PREFIXO_DE_TESTE}: total', count(*)::text from public.cidades where nome_busca like '${PREFIXO_DE_TESTE}%'
union all
select '6 prefixo ${PREFIXO_DE_TESTE}: ' || id, nome || ' | ' || uf from public.cidades where nome_busca like '${PREFIXO_DE_TESTE}%'
union all
select '7 indice', indexdef from pg_indexes where schemaname = 'public' and indexname = 'cidades_nome_busca_idx'
order by 1, 2;
`;
}

function falharSeHouverErros(erros) {
  if (erros.length === 0) return;
  console.error(`Validação falhou, com ${erros.length} erro(s). Nenhum arquivo SQL foi gravado.`);
  for (const erro of erros.slice(0, 30)) console.error(`- ${erro}`);
  process.exit(1);
}

async function main() {
  const auditoria = pastaDeAuditoria();
  const estados = await baixar('estados');
  const municipios = await baixar('municipios');

  mkdirSync(auditoria, { recursive: true });
  writeFileSync(join(auditoria, 'ibge-estados.json'), estados.bruto);
  writeFileSync(join(auditoria, 'ibge-municipios.json'), municipios.bruto);

  const { ufs, erros: errosDosEstados } = montarMapaDeUfs(estados.dados);
  falharSeHouverErros(errosDosEstados);
  const { cidades, erros: errosDasCidades } = montarCidades(municipios.dados, ufs);
  falharSeHouverErros(errosDasCidades);
  const traducao = montarTraducao(cidades);
  falharSeHouverErros(traducao.erros);

  const divergencias = compararControles(cidades);
  const dataDaCarga = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
  const arquivos = dividirEmPartes(cidades).map((parte, indice) => ({
    nome: `007_cidades_carga_parte${indice + 1}.sql`,
    total: parte.length,
    conteudo: gerarParte(parte, indice + 1, dataDaCarga),
  }));
  arquivos.push({
    nome: '007_cidades_verificacao.sql',
    conteudo: gerarVerificacao(cidades, traducao, divergencias, dataDaCarga),
  });

  for (const { nome, conteudo } of arquivos) writeFileSync(join(MIGRATIONS, nome), conteudo);

  console.log(`Total de municípios: ${cidades.length}`);
  console.log(`UFs: ${new Set(cidades.map(({ uf }) => uf)).size}`);
  for (const { nome, total, conteudo } of arquivos) {
    const tamanho = (Buffer.byteLength(conteudo) / 1024).toFixed(1);
    console.log(`${nome}: ${tamanho} KB${total ? `, ${total} municípios` : ''}`);
  }
  console.log(`Resposta bruta da API: ${auditoria}`);
  console.log(divergencias.length === 0 ? 'Controles: sem divergência.' : `DIVERGÊNCIAS NOS CONTROLES:\n${divergencias.join('\n')}`);
}

main().catch((erro) => {
  console.error(`Falha, e nenhum arquivo SQL foi gravado: ${erro.message}`);
  process.exit(1);
});
