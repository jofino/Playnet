import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthStepScreen, authInputStyle } from '@/components/auth/auth-step-screen';
import { TextField } from '@/components/text-field';
import { useAuthFlow } from '@/lib/auth-flow-context';
import { isValidEmail } from '@/utils/auth-validation';

export default function EmailScreen() {
  const router = useRouter();
  const flow = useAuthFlow();
  const [email, setEmail] = useState(flow.email);
  const canSubmit = isValidEmail(email);

  // O app sempre começa na tela inicial, mesmo se abrir ou recarregar nesta rota.
  if (!flow.started) return <Redirect href="/entrar" />;

  function submit() {
    if (!canSubmit) return;
    flow.setEmail(email.trim());
    router.push('/conta');
  }

  return (
    <AuthStepScreen
      icon={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
      title="Vamos começar com o seu e-mail"
      submitLabel="Continuar"
      canSubmit={canSubmit}
      onSubmit={submit}>
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        placeholder="voce@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        autoFocus
        returnKeyType="next"
        onSubmitEditing={submit}
        style={authInputStyle}
      />
    </AuthStepScreen>
  );
}
