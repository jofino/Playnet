import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type PreferenceCardProps = {
  emoji: string;
  label: string;
  value?: string;
  onPress?: () => void;
};

export function PreferenceCard({ emoji, label, value, onPress }: PreferenceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value ?? 'não definido'}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.texts}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, !value && styles.empty]}>{value ?? 'Não definido'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
  },
  emoji: {
    fontSize: 22,
  },
  texts: {
    flex: 1,
    gap: Spacing.one,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
  },
  value: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 700,
  },
  empty: {
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});
