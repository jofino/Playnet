import type { City } from '@/data/cities';
import { supabase } from '@/lib/supabase';
import { toCityPrefixPattern } from '@/utils/city-search';

const MAX_CITY_RESULTS = 20;

/** Busca cidades pelo começo do nome. `term` já vem de `toCitySearchTerm`. */
export async function searchCities(term: string): Promise<City[]> {
  const { data, error } = await supabase
    .from('cidades')
    .select('id, nome, uf')
    // LIKE, e não ILIKE: só o LIKE aproveita o índice de `nome_busca`, que já está em minúsculas.
    .like('nome_busca', toCityPrefixPattern(term))
    .order('nome_busca', { ascending: true })
    .order('uf', { ascending: true })
    .limit(MAX_CITY_RESULTS);
  if (error) throw error;
  return data.map((row) => ({ id: row.id, name: row.nome, state: row.uf }));
}
