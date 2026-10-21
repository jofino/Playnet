import { useReducer } from 'react';

import type { Sport } from '@/constants/sports';
import { STATE_NAMES, type RankedPlayer, type StateCode } from '@/data/ranking';

export type RankingFilters = {
  sport: Sport;
  /** `null` = todos os estados. */
  state: StateCode | null;
  /** `null` = todas as cidades do estado. */
  city: string | null;
};

type FilterAction =
  | { type: 'sport'; sport: Sport }
  | { type: 'state'; state: StateCode | null }
  | { type: 'city'; city: string | null };

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function filtersReducer(
  players: RankedPlayer[],
  filters: RankingFilters,
  action: FilterAction
): RankingFilters {
  switch (action.type) {
    case 'sport': {
      // Mantém a região escolhida se ela também tiver jogadores no novo esporte.
      const sportPlayers = players.filter((player) => player.sport === action.sport);
      const state =
        filters.state && sportPlayers.some((player) => player.state === filters.state)
          ? filters.state
          : null;
      const city =
        state &&
        filters.city &&
        sportPlayers.some((player) => player.state === state && player.city === filters.city)
          ? filters.city
          : null;
      return { sport: action.sport, state, city };
    }
    case 'state':
      // As cidades dependem do estado, então a cidade volta para "todas".
      return { ...filters, state: action.state, city: null };
    case 'city':
      return { ...filters, city: action.city };
  }
}

/**
 * Estado dos filtros do Ranking (esporte, estado e cidade), as opções disponíveis
 * para cada filtro e a classificação resultante da combinação deles.
 */
export function useRankingFilters(players: RankedPlayer[], initialSport: Sport) {
  const [filters, dispatch] = useReducer(
    (current: RankingFilters, action: FilterAction) => filtersReducer(players, current, action),
    { sport: initialSport, state: null, city: null }
  );

  const sportPlayers = players.filter((player) => player.sport === filters.sport);

  const stateOptions = unique(sportPlayers.map((player) => player.state)).sort((a, b) =>
    STATE_NAMES[a].localeCompare(STATE_NAMES[b])
  );
  const cityOptions = filters.state
    ? unique(
        sportPlayers.filter((player) => player.state === filters.state).map((player) => player.city)
      ).sort((a, b) => a.localeCompare(b))
    : [];

  const ranking = sportPlayers
    .filter((player) => !filters.state || player.state === filters.state)
    .filter((player) => !filters.city || player.city === filters.city)
    .sort((a, b) => b.rating - a.rating)
    .map((player, index) => ({ ...player, position: index + 1 }));

  return {
    filters,
    stateOptions,
    cityOptions,
    ranking,
    setSport: (sport: Sport) => dispatch({ type: 'sport', sport }),
    setState: (state: StateCode | null) => dispatch({ type: 'state', state }),
    setCity: (city: string | null) => dispatch({ type: 'city', city }),
  };
}
