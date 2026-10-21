import { createContext, use, useState, type ReactNode } from 'react';

import { MOCK_USER, type User } from '@/data/user';

type UserContextValue = {
  user: User;
  updateUser: (changes: Partial<User>) => void;
};

const UserContext = createContext<UserContextValue | null>(null);

/** Guarda o usuário logado (perfil, foto, Playnet Coins) para todas as telas. */
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(MOCK_USER);

  function updateUser(changes: Partial<User>) {
    setUser((current) => ({ ...current, ...changes }));
  }

  return <UserContext value={{ user, updateUser }}>{children}</UserContext>;
}

export function useUser() {
  const context = use(UserContext);
  if (!context) {
    throw new Error('useUser precisa estar dentro de <UserProvider>.');
  }
  return context;
}
