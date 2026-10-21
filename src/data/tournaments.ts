import type { Sport } from '@/constants/sports';
import { ratingOf } from '@/data/players';
import { bracketChampion, generateBracket, recordBracketResult, type Bracket } from '@/utils/bracket';

// Dados de exemplo até existir um backend.

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

function daysFromNow(days: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

const reiDaPraia: Tournament = {
  id: 't4',
  name: 'Rei da Praia de Futevôlei',
  sport: 'Futevôlei',
  venueId: 'vila-olimpia',
  date: daysFromNow(-1, 9),
  formatId: 'fv-set-unico',
  playersPerSide: 2,
  maxEntries: 4,
  entries: [
    ['Caio Rezende', 'Daniel Peixoto'],
    ['Otávio Brandão', 'Igor Santana'],
    ['Letícia Prado', 'Thiago Lemos'],
    ['Murilo Tavares', 'Sabrina Queiroz'],
  ],
  organizer: 'Caio Rezende',
};
// Torneio em andamento: chaveamento gerado e uma semifinal já decidida.
reiDaPraia.bracket = recordBracketResult(generateBracket(seedOrder(reiDaPraia)), 0, 0, [[18, 14]], 0);

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 't1',
    name: 'Copa Playnet de Tênis',
    sport: 'Tênis',
    venueId: 'pinheiros',
    date: daysFromNow(10, 9),
    formatId: 'tenis-md3-stb',
    playersPerSide: 1,
    maxEntries: 8,
    entries: [['Lucas Andrade'], ['Mariana Costa'], ['Rafael Moreira'], ['Pedro Henrique Dias'], ['Beatriz Lima'], ['Gustavo Pereira']],
    organizer: 'Lucas Andrade',
  },
  {
    id: 't2',
    name: 'Open de Beach Tennis',
    sport: 'Beach Tennis',
    venueId: 'vila-olimpia',
    date: daysFromNow(12, 8),
    formatId: 'bt-set-unico',
    playersPerSide: 2,
    maxEntries: 8,
    entries: [
      ['Leonardo Castro', 'Aline Batista'],
      ['Natália Correia', 'Mateus Araújo'],
      ['Ricardo Vieira', 'Priscila Duarte'],
    ],
    organizer: 'Leonardo Castro',
  },
  {
    id: 't3',
    name: 'Desafio de Tênis de Mesa da Liberdade',
    sport: 'Tênis de Mesa',
    venueId: 'liberdade',
    date: daysFromNow(7, 19),
    formatId: 'tm-md5',
    playersPerSide: 1,
    maxEntries: 16,
    entries: [['Akemi Nakamura'], ['Paulo Sakamoto'], ['Luiza Hayashi'], ['Gustavo Okada']],
    organizer: 'Akemi Nakamura',
  },
  reiDaPraia,
];
