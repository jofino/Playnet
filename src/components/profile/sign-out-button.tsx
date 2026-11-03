import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

/** Encerra a sessão. Ao sair, o layout raiz troca as abas pela tela de entrar. */
export function SignOutButton() {
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePress() {
    setSigningOut(true);
    setError(null);
    const result = await signOut();
    setError(result.error);
    setSigningOut(false);
  }

  return (
    <View style={styles.container}>
      <Button
        label="Sair"
        variant="outline"
        onPress={handlePress}
        disabled={signingOut}
        icon={signingOut ? <ActivityIndicator size="small" color={Colors.primary} /> : undefined}
      />
      {!!error && (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  error: {
    color: '#D92D20',
    fontSize: 14,
    textAlign: 'center',
  },
});
