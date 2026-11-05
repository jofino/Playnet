import type { Session, User } from '@supabase/supabase-js';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { EMAIL_ALREADY_REGISTERED_MESSAGE, getAuthErrorMessage } from '@/lib/auth-errors';
import { supabase } from '@/lib/supabase';

/** `error` já vem traduzido, pronto para exibir na tela. */
type AuthResult = { error: string | null };
type SignUpResult = AuthResult & {
  /** Conta criada, mas sem sessão até o usuário confirmar o e-mail. */
  needsEmailConfirmation: boolean;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** `true` enquanto a sessão salva no aparelho está sendo verificada. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (displayName: string, email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error && getAuthErrorMessage(error) };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
}

async function signUp(displayName: string, email: string, password: string): Promise<SignUpResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
      return { error: getAuthErrorMessage(error), needsEmailConfirmation: false };
    }
    // Com a confirmação de e-mail ligada, o Supabase não acusa e-mail repetido:
    // responde sem erro, com um usuário sem identidades.
    if (data.user?.identities?.length === 0) {
      return { error: EMAIL_ALREADY_REGISTERED_MESSAGE, needsEmailConfirmation: false };
    }
    return { error: null, needsEmailConfirmation: !data.session };
  } catch (error) {
    return { error: getAuthErrorMessage(error), needsEmailConfirmation: false };
  }
}

async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error && getAuthErrorMessage(error) };
  } catch (error) {
    return { error: getAuthErrorMessage(error) };
  }
}

/** Guarda a sessão do Supabase Auth para todo o app. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session);
      })
      .catch(() => {
        // Sem sessão legível, o usuário cai na tela de entrar.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // No navegador o próprio cliente acompanha a visibilidade da aba.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <AuthContext
      value={{ session, user: session?.user ?? null, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = use(AuthContext);
  if (!context) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  }
  return context;
}
