import type { PreferenceKey } from '@/constants/sport-preferences';
import type { Sport } from '@/constants/sports';
import { useUser } from '@/state/user-context';

/** Rating e preferências do usuário logado em um esporte. */
export function useSportProfile(sport: Sport) {
  const { user, updateUser } = useUser();

  /** Define o rating inicial escolhido no nivelamento. */
  function setInitialRating(rating: number) {
    updateUser({
      ratings: { ...user.ratings, [sport]: rating },
      ratingHistory: {
        ...user.ratingHistory,
        [sport]: [{ date: new Date().toISOString(), rating, label: 'Nivelamento' }],
      },
    });
  }

  function savePreferences(preferences: Partial<Record<PreferenceKey, string>>) {
    updateUser({ preferences: { ...user.preferences, [sport]: preferences } });
  }

  return {
    rating: user.ratings[sport] ?? null,
    history: user.ratingHistory[sport] ?? [],
    preferences: user.preferences[sport] ?? {},
    setInitialRating,
    savePreferences,
  };
}
