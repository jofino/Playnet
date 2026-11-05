import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';

import type { User } from '@/data/user';
import { useAuth } from '@/lib/auth-context';
import { getDataErrorMessage } from '@/lib/data-errors';
import { fetchOwnProfileData, UNKNOWN_PLAYER_NAME } from '@/lib/perfis';

type UserContextValue = {
  user: User;
  updateUser: (changes: Partial<User>) => void;
  /** A cidade e as preferências ainda estão vindo do banco. */
  profileLoading: boolean;
  /** Falha ao carregar a cidade e as preferências, já traduzida para exibir na tela. */
  profileError: string | null;
  reloadProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

/**
 * A cidade e as preferências vêm do banco. O resto ainda não tem tabela: começa vazio e só dura
 * enquanto o app está aberto.
 */
const INITIAL_LOCAL_DATA = {
  photoUri: null,
  city: null,
  playnetCoins: 0,
  ownedTitles: [],
  ownedBanners: [],
  currentTitle: null,
  currentBanner: null,
  ratings: {},
  ratingHistory: {},
  preferences: {},
  games: 0,
} satisfies Omit<User, 'id' | 'name' | 'email'>;

function UserState({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const userId = authUser?.id;
  const [localData, setLocalData] = useState(INITIAL_LOCAL_DATA as Omit<User, 'id' | 'name' | 'email'>);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const reloadProfile = useCallback(async () => {
    if (!userId) return;
    try {
      const saved = await fetchOwnProfileData(userId);
      setLocalData((current) => ({ ...current, ...saved }));
      setProfileError(null);
    } catch (failure) {
      setProfileError(getDataErrorMessage(failure));
    } finally {
      setProfileLoading(false);
    }
  }, [userId]);

  // Sem sessão não há o que carregar (as tabelas exigem usuário logado).
  useEffect(() => {
    if (!userId) return;
    let active = true;

    fetchOwnProfileData(userId)
      .then((saved) => {
        if (active) setLocalData((current) => ({ ...current, ...saved }));
      })
      .catch((failure) => {
        if (active) setProfileError(getDataErrorMessage(failure));
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const user: User = {
    ...localData,
    id: authUser?.id ?? '',
    name: authUser?.user_metadata.display_name || UNKNOWN_PLAYER_NAME,
    email: authUser?.email ?? '',
  };

  function updateUser(changes: Partial<User>) {
    setLocalData((current) => ({ ...current, ...changes }));
  }

  return (
    <UserContext value={{ user, updateUser, profileLoading, profileError, reloadProfile }}>
      {children}
    </UserContext>
  );
}

/** Guarda o usuário logado (perfil, foto, Playnet Coins) para todas as telas. */
export function UserProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // A chave recomeça os dados locais quando outra conta entra.
  return <UserState key={user?.id ?? 'sem-sessao'}>{children}</UserState>;
}

export function useUser() {
  const context = use(UserContext);
  if (!context) {
    throw new Error('useUser precisa estar dentro de <UserProvider>.');
  }
  return context;
}
