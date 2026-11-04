import { createContext, use, useReducer, type ReactNode } from 'react';

import type { SetScore } from '@/constants/scoring';
import { seedOrder, type Tournament } from '@/data/tournaments';
import { generateBracket, recordBracketResult } from '@/utils/bracket';

export type NewTournament = Omit<Tournament, 'id' | 'entries' | 'organizer' | 'bracket'>;

type Action =
  | { type: 'create'; tournament: Tournament }
  | { type: 'addEntry'; id: string; entry: string[] }
  | { type: 'removeEntry'; id: string; member: string }
  | { type: 'generateBracket'; id: string }
  | { type: 'recordResult'; id: string; round: number; match: number; result: SetScore[]; winnerSlot: 0 | 1 };

function update(tournaments: Tournament[], id: string, change: (tournament: Tournament) => Tournament) {
  return tournaments.map((tournament) => (tournament.id === id ? change(tournament) : tournament));
}

function reducer(tournaments: Tournament[], action: Action): Tournament[] {
  switch (action.type) {
    case 'create':
      return [...tournaments, action.tournament];
    case 'addEntry':
      return update(tournaments, action.id, (t) =>
        t.bracket || t.entries.length >= t.maxEntries ? t : { ...t, entries: [...t.entries, action.entry] }
      );
    case 'removeEntry':
      return update(tournaments, action.id, (t) =>
        t.bracket ? t : { ...t, entries: t.entries.filter((entry) => !entry.includes(action.member)) }
      );
    case 'generateBracket':
      return update(tournaments, action.id, (t) =>
        t.bracket || t.entries.length < 2 ? t : { ...t, bracket: generateBracket(seedOrder(t)) }
      );
    case 'recordResult':
      return update(tournaments, action.id, (t) =>
        t.bracket
          ? {
              ...t,
              bracket: recordBracketResult(t.bracket, action.round, action.match, action.result, action.winnerSlot),
            }
          : t
      );
  }
}

type TournamentsContextValue = {
  tournaments: Tournament[];
  createTournament: (tournament: NewTournament, organizer: string, firstEntry?: string[]) => string;
  addEntry: (id: string, entry: string[]) => void;
  removeEntry: (id: string, member: string) => void;
  generateBracket: (id: string) => void;
  recordResult: (id: string, round: number, match: number, result: SetScore[], winnerSlot: 0 | 1) => void;
};

const TournamentsContext = createContext<TournamentsContextValue | null>(null);

export function TournamentsProvider({ children }: { children: ReactNode }) {
  const [tournaments, dispatch] = useReducer(reducer, [] as Tournament[]);

  function createTournament(tournament: NewTournament, organizer: string, firstEntry?: string[]) {
    const id = `t${Date.now()}`;
    dispatch({
      type: 'create',
      tournament: { ...tournament, id, organizer, entries: firstEntry ? [firstEntry] : [] },
    });
    return id;
  }

  return (
    <TournamentsContext
      value={{
        tournaments,
        createTournament,
        addEntry: (id, entry) => dispatch({ type: 'addEntry', id, entry }),
        removeEntry: (id, member) => dispatch({ type: 'removeEntry', id, member }),
        generateBracket: (id) => dispatch({ type: 'generateBracket', id }),
        recordResult: (id, round, match, result, winnerSlot) =>
          dispatch({ type: 'recordResult', id, round, match, result, winnerSlot }),
      }}>
      {children}
    </TournamentsContext>
  );
}

export function useTournaments() {
  const context = use(TournamentsContext);
  if (!context) throw new Error('useTournaments precisa estar dentro de <TournamentsProvider>.');
  return context;
}
