import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type StoreItemCardProps = {
  /** Ícone em círculo à esquerda (ex.: títulos). */
  emoji?: string;
  /** Prévia larga exibida no topo do cartão (ex.: banners). */
  cover?: ReactNode;
  name: string;
  description: string;
  /** Preço em Playnet Coins. */
  price: number;
  /** Botão ou estado exibido à direita (ex.: "Comprar", "Em uso"). */
  action: ReactNode;
};

/** Cartão padrão de item da Loja (títulos, banners, produtos...). */
export function StoreItemCard({ emoji, cover, name, description, price, action }: StoreItemCardProps) {
  return (
    <View style={styles.card}>
      {cover}
      <View style={styles.body}>
        {emoji && (
          <View style={styles.emojiCircle}>
            <Text style={styles.emoji}>{emoji}</Text>
          </View>
        )}
        <View style={styles.texts}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.price}>🪙 {price.toLocaleString('pt-BR')} Playnet Coins</Text>
        </View>
        {action}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    padding: Spacing.three,
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  texts: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 800,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  price: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: 700,
    marginTop: Spacing.half,
  },
});
