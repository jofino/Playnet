import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import type { Match } from '@/data/matches';
import { useAuth } from '@/lib/auth-context';
import {
  createMatch as insertMatch,
  fetchUpcomingMatches,
  getMatchErrorMessage,
  joinMatch as insertParticipant,
  leaveMatch as deleteParticipant,
  type NewMatch,
} from '@/lib/partidas';

type MatchesContextValue = {
  /** Próximas partidas, da mais próxima para a mais distante. */
  matches: Match[];
  loading: boolean;
  /** Falha ao carregar, já traduzida para exibir na tela. */
  error: string | null;
  refresh: () => Promise<void>;
  /** Devolve o id da partida criada. */
  createMatch: (match: NewMatch) => Promise<string>;
  joinMatch: (id: string) => Promise<void>;
  leaveMatch: (id: string) => Promise<void>;
};

const MatchesContext = createContext<MatchesContextValue | null>(null);

function MatchesState({ userId, children }: { userId?: string; children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await fetchUpcomingMatches();
      setMatches(next);
      setError(null);
    } catch (failure) {
      setError(getMatchErrorMessage(failure));
    } finally {
      setLoading(false);
    }
  }, []);

  // Sem sessão não há o que carregar (as tabelas exigem usuário logado).
  useEffect(() => {
    if (!userId) return;
    let active = true;

    fetchUpcomingMatches()
      .then((next) => {
        if (active) setMatches(next);
      })
      .catch((failure) => {
        if (active) setError(getMatchErrorMessage(failure));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <MatchesContext
      value={{
        matches,
        loading,
        error,
        refresh,
        createMatch: async (match) => {
          const id = await insertMatch(match);
          await refresh();
          return id;
        },
        joinMatch: async (id) => {
          await insertParticipant(id);
          await refresh();
        },
        leaveMatch: async (id) => {
          if (!userId) return;
          await deleteParticipant(id, userId);
          await refresh();
        },
      }}>
      {children}
    </MatchesContext>
  );
}

/** Partidas do Supabase, compartilhadas entre Jogar, Encontrar partida e detalhes. */
export function MatchesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // A chave descarta a lista da conta anterior quando outra entra.
  return (
    <MatchesState key={user?.id ?? 'sem-sessao'} userId={user?.id}>
      {children}
    </MatchesState>
  );
}

export function useMatchesStore() {
  const context = use(MatchesContext);
  if (!context) {
    throw new Error('useMatchesStore precisa estar dentro de <MatchesProvider>.');
  }
  return context;
}
