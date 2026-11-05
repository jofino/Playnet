import { Stack } from 'expo-router';

import { AuthFlowProvider } from '@/lib/auth-flow-context';

export default function AuthLayout() {
  return (
    <AuthFlowProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="entrar" options={{ title: 'Entrar' }} />
        <Stack.Screen name="email" options={{ title: 'E-mail' }} />
        <Stack.Screen name="conta" options={{ title: 'Sua conta' }} />
        <Stack.Screen name="senha" options={{ title: 'Senha' }} />
        <Stack.Screen name="nome" options={{ title: 'Nome' }} />
        <Stack.Screen name="criar-senha" options={{ title: 'Criar senha' }} />
      </Stack>
    </AuthFlowProvider>
  );
}
