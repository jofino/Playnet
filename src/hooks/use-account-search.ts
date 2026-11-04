import { useEffect, useState } from 'react';

import { getDataErrorMessage } from '@/lib/data-errors';
import { MIN_SEARCH_LENGTH, searchProfiles, type Profile } from '@/lib/perfis';

const DEBOUNCE_MS = 300;

type SearchResult = { query: string; users: Profile[]; error: string | null };

/** Busca de contas enquanto o usuário digita, esperando uma pausa antes de consultar. */
export function useAccountSearch() {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [attempt, setAttempt] = useState(0);

  const query = term.trim();
  const searchable = query.length >= MIN_SEARCH_LENGTH;

  useEffect(() => {
    if (!searchable) return;
    let active = true;

    const timer = setTimeout(() => {
      searchProfiles(query)
        .then((users) => {
          if (active) setResult({ query, users, error: null });
        })
        .catch((failure) => {
          if (active) setResult({ query, users: [], error: getDataErrorMessage(failure) });
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
    /** Há algo digitado: a tela mostra a busca no lugar do feed. */
    active: query.length > 0,
    searchable,
    loading: searchable && !current,
    users: current?.users ?? [],
    error: current?.error ?? null,
    retry: () => {
      setResult(null);
      setAttempt((value) => value + 1);
    },
  };
}
