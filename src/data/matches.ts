import { getFormat, validateMatch, type SetScore } from '@/constants/scoring';
import type { Sport } from '@/constants/sports';
import { ME } from '@/data/players';

// Dados de exemplo até existir um backend.

export type Match = {
  id: string;
  sport: Sport;
  venueId: string;
  /** Data e hora em ISO 8601. */
  date: string;
  /** Formato de pontuação (id de MATCH_FORMATS). */
  formatId: string;
  /** 1 = simples, 2 = duplas. */
  playersPerSide: 1 | 2;
  /** Jogadores de cada lado; menos que `playersPerSide` = vagas abertas. */
  sides: [string[], string[]];
  createdBy: string;
  /** Placar por set, na ordem [lado 1, lado 2]. */
  result?: SetScore[];
};

export function isMine(match: Match) {
  return match.sides.some((side) => side.includes(ME));
}

/** Partidas com data no passado já foram jogadas (podem receber placar). */
export function isFinished(match: Match, now = Date.now()) {
  return new Date(match.date).getTime() < now;
}

export function openSpots(match: Match) {
  return match.playersPerSide * 2 - match.sides[0].length - match.sides[1].length;
}

/** Ordena por data, da mais próxima para a mais distante. */
export const byDate = (a: Match, b: Match) => a.date.localeCompare(b.date);

/** Lado vencedor (0 ou 1) a partir do placar registrado. */
export function winnerSide(match: Match) {
  if (!match.result) return null;
  const validation = validateMatch(getFormat(match.sport, match.formatId), match.result);
  return validation.ok ? validation.winner : null;
}

/** Texto de um lado, com as vagas abertas, ex.: "Ana e vaga aberta". */
export function formatSide(side: string[], playersPerSide: number) {
  const names = [...side, ...Array(Math.max(0, playersPerSide - side.length)).fill('vaga aberta')];
  const text = names.join(' e ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function daysFromNow(days: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

type Row = [
  id: string,
  sport: Sport,
  venueId: string,
  days: number,
  hour: number,
  formatId: string,
  sides: [string[], string[]],
  result?: SetScore[],
];

const ROWS: Row[] = [
  ['m1', 'Tênis', 'ibirapuera', 1, 9, 'tenis-md3', [[ME], ['Lucas Andrade']]],
  ['m2', 'Padel', 'morumbi', 1, 19, 'padel-md3', [['Ana Clara Mendes', 'Rodrigo Nunes'], ['Isabela Teixeira']]],
  ['m3', 'Beach Tennis', 'vila-olimpia', 2, 8, 'bt-set-unico', [['Mateus Araújo', 'Natália Correia'], ['Aline Batista', 'Leonardo Castro']]],
  ['m11', 'Tênis de Mesa', 'liberdade', 2, 20, 'tm-md5', [['Paulo Sakamoto'], []]],
  ['m4', 'Futevôlei', 'vila-olimpia', 3, 17, 'fv-md3', [['Murilo Tavares', 'Letícia Prado'], []]],
  ['m5', 'Tênis', 'pinheiros', 4, 7, 'tenis-md3-stb', [['Mariana Costa'], []]],
  ['m6', 'Vôlei de Praia', 'tatuape', 5, 10, 'vp-md3', [['Bianca Siqueira', 'Fábio Antunes'], ['Helena Rocha', 'João Pedro Lacerda']]],
  ['m7', 'Tênis', 'santana', 6, 18, 'tenis-set-unico', [['Rafael Moreira'], ['Beatriz Lima']]],

  ['m8', 'Tênis', 'pinheiros', -2, 9, 'tenis-md3', [[ME], ['Mariana Costa']]],
  ['m12', 'Vôlei de Praia', 'mooca', -3, 9, 'vp-md3', [['Bianca Siqueira', 'Fábio Antunes'], ['Helena Rocha', 'João Pedro Lacerda']], [[21, 18], [19, 21], [15, 13]]],
  ['m9', 'Padel', 'morumbi', -4, 20, 'padel-md3', [[ME, 'Carolina Freitas'], ['Rodrigo Nunes', 'Fernanda Lopes']]],
  ['m10', 'Tênis', 'ibirapuera', -9, 8, 'tenis-md3', [[ME], ['Pedro Henrique Dias']], [[6, 4], [3, 6], [7, 5]]],
];

const SINGLES_SPORTS: Sport[] = ['Tênis', 'Tênis de Mesa'];

export const MOCK_MATCHES: Match[] = ROWS.map(([id, sport, venueId, days, hour, formatId, sides, result]) => ({
  id,
  sport,
  venueId,
  date: daysFromNow(days, hour),
  formatId,
  // Os exemplos de tênis e tênis de mesa são de simples; os demais esportes, de duplas.
  playersPerSide: SINGLES_SPORTS.includes(sport) ? 1 : 2,
  sides,
  createdBy: sides[0][0],
  result,
}));
