import type { SetScore } from '@/constants/scoring';

/** Jogo do chaveamento. `slots` guarda índices de inscrições; `null` = a definir (ou BYE na 1ª fase). */
export type BracketMatch = {
  slots: [number | null, number | null];
  result?: SetScore[];
  /** Índice da inscrição vencedora. */
  winner?: number;
};

/** Fases do mata-mata, da primeira à final. */
export type Bracket = BracketMatch[][];

/** Ordem clássica dos cabeças de chave: 1x8, 4x5, 2x7, 3x6 (para 8). */
function seedPositions(size: number) {
  let seeds = [1, 2];
  while (seeds.length < size) {
    const total = seeds.length * 2 + 1;
    seeds = seeds.flatMap((seed) => [seed, total - seed]);
  }
  return seeds;
}

function advance(bracket: Bracket, round: number, matchIndex: number, winner: number) {
  const next = bracket[round + 1];
  if (!next) return;
  const target = next[Math.floor(matchIndex / 2)];
  target.slots[matchIndex % 2] = winner;
}

/**
 * Gera o mata-mata a partir das inscrições já ordenadas da mais forte para a mais fraca.
 * Se faltar gente para fechar a chave, os melhores cabeças avançam direto (BYE).
 */
export function generateBracket(entriesBySeed: number[]): Bracket {
  const size = 2 ** Math.ceil(Math.log2(Math.max(2, entriesBySeed.length)));
  const positions = seedPositions(size);
  const first: BracketMatch[] = [];
  for (let i = 0; i < size; i += 2) {
    const slotOf = (seed: number) => (seed <= entriesBySeed.length ? entriesBySeed[seed - 1] : null);
    first.push({ slots: [slotOf(positions[i]), slotOf(positions[i + 1])] });
  }

  const bracket: Bracket = [first];
  for (let matches = size / 4; matches >= 1; matches /= 2) {
    bracket.push(Array.from({ length: matches }, () => ({ slots: [null, null] })));
  }

  first.forEach((match, index) => {
    const [a, b] = match.slots;
    if (a !== null && b === null) {
      match.winner = a;
      advance(bracket, 0, index, a);
    } else if (a === null && b !== null) {
      match.winner = b;
      advance(bracket, 0, index, b);
    }
  });
  return bracket;
}

/** Registra o placar de um jogo e leva o vencedor para a próxima fase. */
export function recordBracketResult(
  bracket: Bracket,
  round: number,
  matchIndex: number,
  result: SetScore[],
  winnerSlot: 0 | 1
): Bracket {
  const copy: Bracket = bracket.map((matches) =>
    matches.map((match) => ({ ...match, slots: [...match.slots] as BracketMatch['slots'] }))
  );
  const match = copy[round][matchIndex];
  const winner = match.slots[winnerSlot];
  if (winner === null) return bracket;
  match.result = result;
  match.winner = winner;
  advance(copy, round, matchIndex, winner);
  return copy;
}

/** Inscrição campeã, quando a final já tem resultado. */
export function bracketChampion(bracket: Bracket) {
  return bracket[bracket.length - 1]?.[0]?.winner;
}

export function roundName(round: number, totalRounds: number) {
  const fromEnd = totalRounds - round;
  if (fromEnd === 1) return 'Final';
  if (fromEnd === 2) return 'Semifinal';
  if (fromEnd === 3) return 'Quartas de final';
  if (fromEnd === 4) return 'Oitavas de final';
  return `${round + 1}ª fase`;
}
