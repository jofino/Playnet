import type { Sport } from '@/constants/sports';
import { ratingOf } from '@/data/players';
import { useUser } from '@/state/user-context';

/** Peso de cada partida no Elo: quanto o rating pode mudar no máximo. */
const K_FACTOR = 32;

/** Novo rating pelo sistema Elo, contra a média de rating dos adversários. */
export function eloRating(current: number, opponentAverage: number, won: boolean) {
  const expected = 1 / (1 + 10 ** ((opponentAverage - current) / 400));
  return Math.round(current + K_FACTOR * ((won ? 1 : 0) - expected));
}

type RatingResult = { counted: true; before: number; after: number } | { counted: false };

/** Atualiza o rating do usuário (e o histórico) depois de uma partida dele. */
export function useRatingUpdate() {
  const { user, updateUser } = useUser();

  function applyResult(params: {
    sport: Sport;
    opponents: string[];
    won: boolean;
    matchId: string;
  }): RatingResult {
    const { sport, opponents, won, matchId } = params;
    const current = user.ratings[sport];
    if (current === undefined) {
      // Sem nivelamento no esporte o resultado fica registrado, mas não mexe no rating.
      updateUser({ games: user.games + 1 });
      return { counted: false };
    }

    const opponentAverage =
      opponents.reduce((sum, name) => sum + ratingOf(name, sport), 0) / Math.max(1, opponents.length);
    const after = eloRating(current, opponentAverage, won);
    // O histórico segue a ordem em que o rating mudou (o registro do placar), não a data do jogo:
    // uma partida antiga registrada depois do nivelamento entra depois dele.
    const history = [
      ...(user.ratingHistory[sport] ?? []),
      { date: new Date().toISOString(), rating: after, label: won ? 'Vitória' : 'Derrota', matchId },
    ];

    updateUser({
      games: user.games + 1,
      ratings: { ...user.ratings, [sport]: after },
      ratingHistory: { ...user.ratingHistory, [sport]: history },
    });
    return { counted: true, before: current, after };
  }

  return { applyResult };
}
