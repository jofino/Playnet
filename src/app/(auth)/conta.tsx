import { Redirect, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AuthStepScreen } from '@/components/auth/auth-step-screen';
import { Button } from '@/components/button';
import { useAuthFlow } from '@/lib/auth-flow-context';

export default function ContaScreen() {
  const router = useRouter();
  const { email } = useAuthFlow();

  if (!email) return <Redirect href="/entrar" />;

  return (
    <AuthStepScreen
      icon={{ ios: 'person.fill', android: 'person', web: 'person' }}
      title="Você já tem conta no Playnet?"
      subtitle={email}>
      <Button label="Já tenho conta" onPress={() => router.push('/senha')} style={styles.option} />
      <Button
        label="Sou novo aqui"
        variant="outline"
        onPress={() => router.push('/nome')}
        style={styles.option}
      />
    </AuthStepScreen>
  );
}

const styles = StyleSheet.create({
  option: {
    height: 52,
    borderRadius: 26,
  },
});
