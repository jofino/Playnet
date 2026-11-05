import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthStepScreen, authInputStyle } from '@/components/auth/auth-step-screen';
import { TextField } from '@/components/text-field';
import { useAuthFlow } from '@/lib/auth-flow-context';

export default function NomeScreen() {
  const router = useRouter();
  const flow = useAuthFlow();
  const [displayName, setDisplayName] = useState(flow.displayName);
  const canSubmit = displayName.trim().length > 0;

  if (!flow.email) return <Redirect href="/entrar" />;

  function submit() {
    if (!canSubmit) return;
    flow.setDisplayName(displayName.trim());
    router.push('/criar-senha');
  }

  return (
    <AuthStepScreen
      icon={{ ios: 'person.fill', android: 'person', web: 'person' }}
      title="Como você quer ser chamado?"
      subtitle="É o nome que os outros jogadores vão ver."
      submitLabel="Continuar"
      canSubmit={canSubmit}
      onSubmit={submit}>
      <TextField
        label="Nome de exibição"
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        autoFocus
        returnKeyType="next"
        onSubmitEditing={submit}
        style={authInputStyle}
      />
    </AuthStepScreen>
  );
}
