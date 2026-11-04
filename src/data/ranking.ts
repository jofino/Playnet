import type { Sport } from '@/constants/sports';

export const STATE_NAMES = {
  SP: 'São Paulo',
  RJ: 'Rio de Janeiro',
  MG: 'Minas Gerais',
  PR: 'Paraná',
  SC: 'Santa Catarina',
  RS: 'Rio Grande do Sul',
} as const;

export type StateCode = keyof typeof STATE_NAMES;

export type RankedPlayer = {
  id: string;
  name: string;
  sport: Sport;
  state: StateCode;
  city: string;
  /** Rating do jogador no esporte. */
  rating: number;
};

// O ranking ainda não tem tabela no banco.
export const RANKED_PLAYERS: RankedPlayer[] = [];
