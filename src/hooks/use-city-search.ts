import { useEffect, useState } from 'react';

import type { City } from '@/data/cities';
import { searchCities } from '@/lib/cidades';
import { getDataErrorMessage } from '@/lib/data-errors';
import { MIN_CITY_SEARCH_LENGTH, toCitySearchTerm } from '@/utils/city-search';

const DEBOUNCE_MS = 300;

type SearchResult = { query: string; cities: City[]; error: string | null };

/** Busca de cidades enquanto o usuário digita, esperando uma pausa antes de consultar. */
export function useCitySearch() {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  const query = toCitySearchTerm(term);
  const searchable = query.length >= MIN_CITY_SEARCH_LENGTH;

  useEffect(() => {
    if (!searchable) return;
    let active = true;

    const timer = setTimeout(() => {
      searchCities(query)
        .then((cities) => {
          if (active) setResult({ query, cities, error: null });
        })
        .catch((failure) => {
          if (active) setResult({ query, cities: [], error: getDataErrorMessage(failure) });
        });
    }, DEBOUNCE_MS);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, searchable, attempt]);

  // Resultado de um termo anterior não vale para o que está digitado agora.
  const current = result?.query === query ? result : null;

  return {
    term,
    setTerm,
    searchable,
    loading: searchable && !current,
    cities: current?.cities ?? [],
    error: current?.error ?? null,
    retry: () => {
      setResult(null);
      setAttempt((value) => value + 1);
    },
  };
}
