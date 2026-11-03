import { Redirect } from 'expo-router';
import { useState } from 'react';

import { AuthStepScreen, authInputStyle } from '@/components/auth/auth-step-screen';
import { PasswordField } from '@/components/auth/password-field';
import { useAuth } from '@/lib/auth-context';
import { useAuthFlow } from '@/lib/auth-flow-context';
import { isValidPassword } from '@/utils/auth-validation';

export default function SenhaScreen() {
  const { signIn } = useAuth();
  const { email } = useAuthFlow();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = isValidPassword(password);

  if (!email) return <Redirect href="/entrar" />;

  async function submit() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);
    // Com sucesso, a sessão muda e o layout raiz troca estas etapas pelas abas.
    const result = await signIn(email, password);
    setError(result.error);
    setSubmitting(false);
  }

  return (
    <AuthStepScreen
      icon={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
      title="Digite sua senha"
      subtitle={email}
      error={error}
      submitLabel="Entrar"
      canSubmit={canSubmit}
      submitting={submitting}
      onSubmit={submit}>
      <PasswordField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        editable={!submitting}
        autoComplete="current-password"
        textContentType="password"
        autoFocus
        returnKeyType="go"
        onSubmitEditing={submit}
        style={authInputStyle}
      />
    </AuthStepScreen>
  );
}
