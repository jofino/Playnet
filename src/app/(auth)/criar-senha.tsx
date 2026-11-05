import { Redirect } from 'expo-router';
import { useState } from 'react';

import { AuthStepScreen, authInputStyle } from '@/components/auth/auth-step-screen';
import { PasswordField } from '@/components/auth/password-field';
import { useAuth } from '@/lib/auth-context';
import { useAuthFlow } from '@/lib/auth-flow-context';
import { isValidPassword, MIN_PASSWORD_LENGTH } from '@/utils/auth-validation';

export default function CriarSenhaScreen() {
  const { signUp } = useAuth();
  const { email, displayName } = useAuthFlow();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = isValidPassword(password) && confirmPassword === password;
  // Só acusa quando já divergiu, não enquanto a confirmação ainda está sendo digitada.
  const confirmDiverged = !password.startsWith(confirmPassword);

  if (!email || !displayName) return <Redirect href="/entrar" />;

  async function submit() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);
    setNotice(null);
    // Se o cadastro já devolver a sessão, o layout raiz troca estas etapas pelas abas.
    const result = await signUp(displayName, email, password);
    setError(result.error);
    if (result.needsEmailConfirmation) {
      setNotice('Conta criada! Confirme pelo link que enviamos para o seu e-mail e depois entre.');
    }
    setSubmitting(false);
  }

  return (
    <AuthStepScreen
      icon={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
      title="Crie uma senha"
      subtitle={`Use pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`}
      error={error}
      notice={notice}
      submitLabel="Criar conta"
      canSubmit={canSubmit}
      submitting={submitting}
      onSubmit={submit}>
      <PasswordField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        editable={!submitting}
        autoComplete="new-password"
        textContentType="newPassword"
        autoFocus
        returnKeyType="next"
        style={authInputStyle}
      />
      <PasswordField
        label="Confirmar senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={confirmDiverged ? 'As senhas não são iguais.' : undefined}
        editable={!submitting}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={submit}
        style={authInputStyle}
      />
    </AuthStepScreen>
  );
}
