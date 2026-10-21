import type { SetScore } from '@/constants/scoring';
import type { Match } from '@/data/matches';
import { ME } from '@/data/players';
import { useRatingUpdate } from '@/hooks/use-rating-update';
import { useMatchesStore } from '@/state/matches-context';

/** Salva o placar de uma partida e, se o usuário jogou, atualiza o rating dele (Elo). */
export function useReportMatch() {
  const { reportResult } = useMatchesStore();
  const { applyResult } = useRatingUpdate();

  return (match: Match, result: SetScore[], winner: 0 | 1) => {
    reportResult(match.id, result);
    const mySide = match.sides.findIndex((side) => side.includes(ME));
    if (mySide < 0) return null;
    return applyResult({
      sport: match.sport,
      opponents: match.sides[1 - mySide],
      won: winner === mySide,
      matchId: match.id,
    });
  };
}
