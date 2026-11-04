import type { Sport } from '@/constants/sports';

export const MATCH_LEVELS = ['Iniciante', 'Intermediário', 'Avançado'] as const;

export type MatchParticipant = { id: string; name: string };

export type Match = {
  id: string;
  creatorId: string;
  sport: Sport;
  place: string;
  city: string;
  level: string;
  /** Data e hora em ISO 8601. */
  date: string;
  /** Total de jogadores, incluindo quem criou. */
  spots: number;
  participants: MatchParticipant[];
};

export function isMine(match: Match, userId: string) {
  return match.participants.some((participant) => participant.id === userId);
}

/** Partidas com data no passado já foram jogadas. */
export function isFinished(match: Match, now = Date.now()) {
  return new Date(match.date).getTime() < now;
}

export function openSpots(match: Match) {
  return Math.max(0, match.spots - match.participants.length);
}

/** Ordena por data, da mais próxima para a mais distante. */
export const byDate = (a: Match, b: Match) => a.date.localeCompare(b.date);

/** Texto de um lado de um torneio, com as vagas abertas, ex.: "Ana e vaga aberta". */
export function formatSide(side: string[], playersPerSide: number) {
  const names = [...side, ...Array(Math.max(0, playersPerSide - side.length)).fill('vaga aberta')];
  const text = names.join(' e ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
