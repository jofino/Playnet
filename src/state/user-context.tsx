import { createContext, use, useState, type ReactNode } from 'react';

import type { User } from '@/data/user';
import { useAuth } from '@/lib/auth-context';
import { UNKNOWN_PLAYER_NAME } from '@/lib/perfis';

type UserContextValue = {
  user: User;
  updateUser: (changes: Partial<User>) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

/** Tudo o que ainda não tem tabela no banco: começa vazio e só dura enquanto o app está aberto. */
const INITIAL_LOCAL_DATA = {
  photoUri: null,
  location: null,
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
  const [localData, setLocalData] = useState(INITIAL_LOCAL_DATA as Omit<User, 'id' | 'name' | 'email'>);

  const user: User = {
    ...localData,
    id: authUser?.id ?? '',
    name: authUser?.user_metadata.display_name || UNKNOWN_PLAYER_NAME,
    email: authUser?.email ?? '',
  };

  function updateUser(changes: Partial<User>) {
    setLocalData((current) => ({ ...current, ...changes }));
  }

  return <UserContext value={{ user, updateUser }}>{children}</UserContext>;
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
