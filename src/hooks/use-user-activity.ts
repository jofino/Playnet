import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { isFinished, type Match } from '@/data/matches';
import { getMatchErrorMessage, fetchUserMatches } from '@/lib/partidas';

/** Partidas de um usuário, recarregadas sempre que a tela volta ao foco. */
export function useUserActivity(userId: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setMatches(await fetchUserMatches(userId));
      setError(null);
    } catch (failure) {
      setError(getMatchErrorMessage(failure));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return {
    /** Jogos já realizados, do mais recente para o mais antigo. */
    played: matches.filter((match) => isFinished(match)),
    /** Próximas partidas, da mais próxima para a mais distante. */
    upcoming: matches.filter((match) => !isFinished(match)).reverse(),
    loading,
    error,
    reload,
  };
}
