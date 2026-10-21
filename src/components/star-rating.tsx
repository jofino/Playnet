import { StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

const MAX_STARS = 5;

type StarRatingProps = {
  /** Média de 0 a 5. */
  value: number;
  /** Quantidade de avaliações, exibida entre parênteses. */
  reviews?: number;
};

/** Estrelas de avaliação com a nota ao lado, ex.: ★★★★★ 4,8 (128). */
export function StarRating({ value, reviews }: StarRatingProps) {
  const filled = Math.round(value);
  const formatted = value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Nota ${formatted} de 5${reviews !== undefined ? `, ${reviews} avaliações` : ''}`}>
      <Text style={styles.stars}>
        {Array.from({ length: MAX_STARS }, (_, index) => (
          <Text key={index} style={index < filled ? styles.filled : styles.empty}>
            ★
          </Text>
        ))}
      </Text>
      <Text style={styles.value}>{formatted}</Text>
      {reviews !== undefined && <Text style={styles.reviews}>({reviews})</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  stars: {
    fontSize: 14,
    letterSpacing: 1,
  },
  filled: {
    color: '#F5A623',
  },
  empty: {
    color: Colors.border,
  },
  value: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: 800,
  },
  reviews: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
