import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

/** Cartão com o saldo de Playnet Coins do usuário. */
export function PlaynetCoinsBalance({ amount }: { amount: number }) {
  const formatted = amount.toLocaleString('pt-BR');

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`Seu saldo: ${formatted} Playnet Coins`}>
      <View style={styles.texts}>
        <Text style={styles.caption}>Seu saldo</Text>
        <Text style={styles.amount}>{formatted}</Text>
        <Text style={styles.currency}>Playnet Coins</Text>
      </View>
      <View style={styles.coin}>
        <SymbolView
          name={{ ios: 'dollarsign.circle.fill', android: 'paid', web: 'paid' }}
          tintColor={Colors.primary}
          size={36}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    boxShadow: '0 4px 12px rgba(224, 84, 52, 0.3)',
  },
  texts: {
    flex: 1,
  },
  caption: {
    color: Colors.onPrimary,
    opacity: 0.85,
    fontSize: 14,
    fontWeight: 600,
  },
  amount: {
    color: Colors.onPrimary,
    fontSize: 34,
    fontWeight: 800,
  },
  currency: {
    color: Colors.onPrimary,
    fontSize: 15,
    fontWeight: 700,
  },
  coin: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
