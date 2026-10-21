import type { Sport } from '@/constants/sports';

/**
 * Regras de pontuação de cada esporte: formatos de partida e como cada set termina.
 * É a fonte única usada para criar partidas/torneios e validar placares.
 */

/** Placar de um set: [lado 1, lado 2]. */
export type SetScore = [number, number];

export type SetRule =
  /** Set de games até 6, com tie-break em 6-6: termina em 6-0 a 6-4, 7-5 ou 7-6. */
  | { kind: 'games' }
  /** Set de pontos até `target`, com 2 pontos de diferença (sem limite). */
  | { kind: 'points'; target: number }
  /** Super tie-break no lugar do set decisivo: até 10 pontos, com 2 de diferença. */
  | { kind: 'superTiebreak' };

export type MatchFormat = {
  id: string;
  label: string;
  /** Sets que um lado precisa vencer. */
  setsToWin: number;
  /** Regra de cada set possível, na ordem (o tamanho é o máximo de sets). */
  sets: SetRule[];
};

const GAMES: SetRule = { kind: 'games' };
const SUPER_TIEBREAK: SetRule = { kind: 'superTiebreak' };
const points = (target: number): SetRule => ({ kind: 'points', target });

export const MATCH_FORMATS: Record<Sport, MatchFormat[]> = {
  Tênis: [
    { id: 'tenis-md3', label: 'Melhor de 3 sets', setsToWin: 2, sets: [GAMES, GAMES, GAMES] },
    {
      id: 'tenis-md3-stb',
      label: 'Melhor de 3 com super tie-break',
      setsToWin: 2,
      sets: [GAMES, GAMES, SUPER_TIEBREAK],
    },
    { id: 'tenis-set-unico', label: 'Set único', setsToWin: 1, sets: [GAMES] },
  ],
  'Beach Tennis': [
    { id: 'bt-set-unico', label: 'Set único', setsToWin: 1, sets: [GAMES] },
    {
      id: 'bt-md3-stb',
      label: 'Melhor de 3 com super tie-break',
      setsToWin: 2,
      sets: [GAMES, GAMES, SUPER_TIEBREAK],
    },
  ],
  Futevôlei: [
    { id: 'fv-set-unico', label: 'Set único de 18 pontos', setsToWin: 1, sets: [points(18)] },
    {
      id: 'fv-md3',
      label: 'Melhor de 3 (18, 18 e 15 pontos)',
      setsToWin: 2,
      sets: [points(18), points(18), points(15)],
    },
  ],
  'Vôlei de Praia': [
    {
      id: 'vp-md3',
      label: 'Melhor de 3 (21, 21 e 15 pontos)',
      setsToWin: 2,
      sets: [points(21), points(21), points(15)],
    },
    { id: 'vp-set-unico', label: 'Set único de 21 pontos', setsToWin: 1, sets: [points(21)] },
  ],
  Padel: [
    { id: 'padel-md3', label: 'Melhor de 3 sets', setsToWin: 2, sets: [GAMES, GAMES, GAMES] },
    {
      id: 'padel-md3-stb',
      label: 'Melhor de 3 com super tie-break',
      setsToWin: 2,
      sets: [GAMES, GAMES, SUPER_TIEBREAK],
    },
  ],
  'Tênis de Mesa': [
    { id: 'tm-md5', label: 'Melhor de 5 sets de 11 pontos', setsToWin: 3, sets: Array(5).fill(points(11)) },
    { id: 'tm-md3', label: 'Melhor de 3 sets de 11 pontos', setsToWin: 2, sets: Array(3).fill(points(11)) },
    { id: 'tm-md7', label: 'Melhor de 7 sets de 11 pontos', setsToWin: 4, sets: Array(7).fill(points(11)) },
  ],
};

/** Simples (1 por lado) e/ou duplas (2 por lado) em cada esporte. */
export const SPORT_MODALITIES: Record<Sport, ('Simples' | 'Duplas')[]> = {
  Tênis: ['Simples', 'Duplas'],
  'Beach Tennis': ['Duplas'],
  Futevôlei: ['Duplas'],
  'Vôlei de Praia': ['Duplas'],
  Padel: ['Duplas'],
  'Tênis de Mesa': ['Simples', 'Duplas'],
};

export function getFormat(sport: Sport, formatId: string) {
  return MATCH_FORMATS[sport].find((format) => format.id === formatId) ?? MATCH_FORMATS[sport][0];
}

/** Texto curto da regra, ex.: "até 21 pontos, 2 de diferença". */
export function describeSetRule(rule: SetRule) {
  switch (rule.kind) {
    case 'games':
      return 'até 6 games, tie-break em 6-6';
    case 'points':
      return `até ${rule.target} pontos, 2 de diferença`;
    case 'superTiebreak':
      return 'super tie-break até 10, 2 de diferença';
  }
}

/** Regras do formato por extenso, ex.: "Vence quem fizer 2 sets. Sets até 21 pontos…; set decisivo: até 15…". */
export function describeFormat(format: MatchFormat) {
  if (format.sets.length === 1) return `Set único, ${describeSetRule(format.sets[0])}.`;
  const regular = describeSetRule(format.sets[0]);
  const decider = describeSetRule(format.sets[format.sets.length - 1]);
  const base = `Vence quem fizer ${format.setsToWin} sets. Sets ${regular}`;
  return regular === decider ? `${base}.` : `${base}; set decisivo: ${decider}.`;
}

/** Erro de um set, ou `null` se o placar é possível pela regra. */
export function validateSet(rule: SetRule, [a, b]: SetScore): string | null {
  const winner = Math.max(a, b);
  const loser = Math.min(a, b);
  if (a === b) return 'um set não termina empatado';

  if (rule.kind === 'games') {
    const valid = (winner === 6 && loser <= 4) || (winner === 7 && (loser === 5 || loser === 6));
    return valid ? null : 'um set de games termina em 6-0 a 6-4, 7-5 ou 7-6';
  }

  const target = rule.kind === 'superTiebreak' ? 10 : rule.target;
  if (winner < target) return `o set vai até ${target} pontos`;
  if (winner === target) {
    return loser <= target - 2
      ? null
      : `com ${loser} pontos do outro lado, o set continua até alguém abrir 2 de diferença`;
  }
  return winner - loser === 2
    ? null
    : `passando de ${target} pontos, o set termina assim que alguém abre 2 de diferença`;
}

export type MatchValidation =
  | { ok: true; winner: 0 | 1; setsWon: [number, number] }
  | { ok: false; error: string };

/** Valida os sets de uma partida no formato dado e aponta o lado vencedor. */
export function validateMatch(format: MatchFormat, sets: SetScore[]): MatchValidation {
  if (sets.length === 0) return { ok: false, error: 'Preencha o placar de pelo menos um set.' };
  if (sets.length > format.sets.length) {
    return { ok: false, error: `Este formato tem no máximo ${format.sets.length} sets.` };
  }

  const won: [number, number] = [0, 0];
  for (let index = 0; index < sets.length; index++) {
    if (won[0] === format.setsToWin || won[1] === format.setsToWin) {
      return {
        ok: false,
        error: `A partida já terminou no ${index}º set. Apague os sets seguintes.`,
      };
    }
    const error = validateSet(format.sets[index], sets[index]);
    if (error) return { ok: false, error: `${index + 1}º set: ${error}.` };
    won[sets[index][0] > sets[index][1] ? 0 : 1]++;
  }

  if (won[0] < format.setsToWin && won[1] < format.setsToWin) {
    return {
      ok: false,
      error: `Partida incompleta: é preciso vencer ${format.setsToWin} ${format.setsToWin === 1 ? 'set' : 'sets'}.`,
    };
  }
  return { ok: true, winner: won[0] > won[1] ? 0 : 1, setsWon: won };
}
