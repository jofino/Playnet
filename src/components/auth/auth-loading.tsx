import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

/** Exibida enquanto a sessão salva é verificada, para a tela de entrar não piscar. */
export function AuthLoading() {
  return (
    <View style={styles.screen} accessibilityLabel="Carregando" accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
