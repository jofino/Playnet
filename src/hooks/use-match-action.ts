import { useState } from 'react';

import { isFinished, isMine, openSpots, type Match } from '@/data/matches';
import { getMatchErrorMessage } from '@/lib/partidas';
import { useMatchesStore } from '@/state/matches-context';
import { useUser } from '@/state/user-context';

/** Entrar e sair de uma partida, com o que a tela precisa mostrar enquanto isso. */
export function useMatchAction(match: Match) {
  const { user } = useUser();
  const { joinMatch, leaveMatch } = useMatchesStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mine = isMine(match, user.id);
  const finished = isFinished(match);

  async function run(action: (id: string) => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action(match.id);
    } catch (failure) {
      setError(getMatchErrorMessage(failure));
    } finally {
      setBusy(false);
    }
  }

  return {
    mine,
    canJoin: !finished && !mine && openSpots(match) > 0,
    canLeave: !finished && mine,
    busy,
    error,
    join: () => run(joinMatch),
    leave: () => run(leaveMatch),
  };
}
