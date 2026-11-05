import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getDataErrorMessage } from '@/lib/data-errors';
import { fetchUserCounts, type UserCounts } from '@/lib/perfis';

/** Contadores do perfil de um usuário, recarregados sempre que a tela volta ao foco. */
export function useUserCounts(userId: string) {
  const [counts, setCounts] = useState<UserCounts | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setCounts(await fetchUserCounts(userId));
      setError(null);
    } catch (failure) {
      setError(getDataErrorMessage(failure));
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return { counts, setCounts, error, reload };
}
