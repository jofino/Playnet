import { createContext, use, useReducer, type ReactNode } from 'react';

import type { SetScore } from '@/constants/scoring';
import type { Sport } from '@/constants/sports';
import { MOCK_MATCHES, openSpots, type Match } from '@/data/matches';
import { ME } from '@/data/players';

export type NewMatch = {
  sport: Sport;
  venueId: string;
  date: string;
  formatId: string;
  playersPerSide: 1 | 2;
  /** Parceiro do usuário (duplas), se já tiver. */
  partner?: string;
  /** Adversários convidados, se houver. */
  opponents?: string[];
};

type Action =
  | { type: 'create'; match: NewMatch; id: string }
  | { type: 'join'; id: string }
  | { type: 'leave'; id: string }
  | { type: 'reportResult'; id: string; result: SetScore[] };

function reducer(matches: Match[], action: Action): Match[] {
  switch (action.type) {
    case 'create': {
      const { partner, opponents = [], ...rest } = action.match;
      return [
        ...matches,
        {
          ...rest,
          id: action.id,
          createdBy: ME,
          sides: [partner ? [ME, partner] : [ME], opponents],
        },
      ];
    }
    case 'join':
      return matches.map((match) => {
        if (match.id !== action.id || openSpots(match) === 0) return match;
        // Entra no lado com vaga, preferindo completar o lado que já tem gente.
        const sideIndex =
          match.sides[0].length < match.playersPerSide &&
          (match.sides[0].length > 0 || match.sides[1].length >= match.playersPerSide)
            ? 0
            : 1;
        const sides: [string[], string[]] = [[...match.sides[0]], [...match.sides[1]]];
        sides[sideIndex].push(ME);
        return { ...match, sides };
      });
    case 'leave':
      return matches.map((match) =>
        match.id === action.id
          ? {
              ...match,
              sides: [
                match.sides[0].filter((name) => name !== ME),
                match.sides[1].filter((name) => name !== ME),
              ],
            }
          : match
      );
    case 'reportResult':
      return matches.map((match) =>
        match.id === action.id ? { ...match, result: action.result } : match
      );
  }
}

type MatchesContextValue = {
  matches: Match[];
  createMatch: (match: NewMatch) => string;
  joinMatch: (id: string) => void;
  leaveMatch: (id: string) => void;
  reportResult: (id: string, result: SetScore[]) => void;
};

const MatchesContext = createContext<MatchesContextValue | null>(null);

/** Partidas da região, compartilhadas entre Jogar, Encontrar partida, perfis e detalhes. */
export function MatchesProvider({ children }: { children: ReactNode }) {
  const [matches, dispatch] = useReducer(reducer, MOCK_MATCHES);

  function createMatch(match: NewMatch) {
    const id = `p${Date.now()}`;
    dispatch({ type: 'create', match, id });
    return id;
  }

  return (
    <MatchesContext
      value={{
        matches,
        createMatch,
        joinMatch: (id) => dispatch({ type: 'join', id }),
        leaveMatch: (id) => dispatch({ type: 'leave', id }),
        reportResult: (id, result) => dispatch({ type: 'reportResult', id, result }),
      }}>
      {children}
    </MatchesContext>
  );
}

export function useMatchesStore() {
  const context = use(MatchesContext);
  if (!context) throw new Error('useMatchesStore precisa estar dentro de <MatchesProvider>.');
  return context;
}
