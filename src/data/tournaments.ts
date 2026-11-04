import type { Sport } from '@/constants/sports';
import { ratingOf } from '@/data/players';
import { bracketChampion, type Bracket } from '@/utils/bracket';

export type Tournament = {
  id: string;
  name: string;
  sport: Sport;
  venueId: string;
  /** Data e hora de início em ISO 8601. */
  date: string;
  /** Formato de pontuação dos jogos (id de MATCH_FORMATS). */
  formatId: string;
  /** 1 = simples, 2 = duplas. */
  playersPerSide: 1 | 2;
  maxEntries: number;
  /** Inscrições: cada uma é um jogador (simples) ou uma dupla. */
  entries: string[][];
  organizer: string;
  /** Mata-mata, depois que o organizador gera o chaveamento. */
  bracket?: Bracket;
};

export type TournamentStatus = 'Inscrições abertas' | 'Inscrições encerradas' | 'Em andamento' | 'Encerrado';

export function tournamentStatus(tournament: Tournament): TournamentStatus {
  if (tournament.bracket) {
    return bracketChampion(tournament.bracket) === undefined ? 'Em andamento' : 'Encerrado';
  }
  return tournament.entries.length >= tournament.maxEntries ? 'Inscrições encerradas' : 'Inscrições abertas';
}

/** Ordem das inscrições da mais forte para a mais fraca (média de rating), para o chaveamento. */
export function seedOrder(tournament: Tournament) {
  const strength = (entry: string[]) =>
    entry.reduce((sum, name) => sum + ratingOf(name, tournament.sport), 0) / entry.length;
  return tournament.entries
    .map((entry, index) => ({ index, strength: strength(entry) }))
    .sort((a, b) => b.strength - a.strength)
    .map((item) => item.index);
}
