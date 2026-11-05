import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Colors, Spacing } from '@/constants/theme';

type StateMessageProps = {
  icon: SymbolViewProps['name'];
  text: string;
  /** Mostra o botão "Tentar novamente". */
  onRetry?: () => void;
};

/** Estado vazio ou de erro de uma lista: ícone, texto e, se houver, a opção de tentar de novo. */
export function StateMessage({ icon, text, onRetry }: StateMessageProps) {
  return (
    <View style={styles.container} accessibilityRole={onRetry ? 'alert' : undefined}>
      <SymbolView name={icon} tintColor={Colors.textSecondary} size={36} />
      <Text style={styles.text}>{text}</Text>
      {onRetry && <Button label="Tentar novamente" size="small" variant="outline" onPress={onRetry} />}
    </View>
  );
}

export const ERROR_ICON: SymbolViewProps['name'] = {
  ios: 'exclamationmark.circle',
  android: 'error',
  web: 'error',
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
