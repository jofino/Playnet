export const MIN_CITY_SEARCH_LENGTH = 2;

/** A mesma regra que gerou `cidades.nome_busca` (ver 007_cidades_carga_parte1.sql). */
export function normalizeCitySearch(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// O "*" também é curinga para a API do banco e não tem como ser escapado, então sai do termo.
export function toCitySearchTerm(text: string) {
  return normalizeCitySearch(text).replaceAll('*', '');
}

/** Padrão de LIKE por prefixo. O termo é literal: "%" e "_" digitados não viram curinga. */
export function toCityPrefixPattern(term: string) {
  return `${term.replace(/[\\%_]/g, '\\$&')}%`;
}
