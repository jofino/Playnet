import { createContext, use, useState, type ReactNode } from 'react';

type AuthFlowContextValue = {
  /** `true` depois de tocar em "Continuar com email" na tela inicial. */
  started: boolean;
  start: () => void;
  email: string;
  setEmail: (email: string) => void;
  displayName: string;
  setDisplayName: (displayName: string) => void;
};

const AuthFlowContext = createContext<AuthFlowContextValue | null>(null);

/**
 * Guarda o que já foi preenchido nas etapas de entrar e criar conta.
 * Fica em memória para o e-mail e o nome não aparecerem na URL da versão web.
 */
export function AuthFlowProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');

  return (
    <AuthFlowContext
      value={{ started, start: () => setStarted(true), email, setEmail, displayName, setDisplayName }}>
      {children}
    </AuthFlowContext>
  );
}

export function useAuthFlow() {
  const context = use(AuthFlowContext);
  if (!context) {
    throw new Error('useAuthFlow precisa estar dentro de <AuthFlowProvider>.');
  }
  return context;
}
