import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type ChipProps = {
  label: string;
  /** Ícone exibido antes do texto. */
  icon?: ReactNode;
  selected?: boolean;
  /**
   * `solid`: selecionado fica laranja com texto branco.
   * `soft`: selecionado fica laranja claro com texto laranja.
   */
  variant?: 'solid' | 'soft';
  disabled?: boolean;
  onPress?: () => void;
};

export function Chip({
  label,
  icon,
  selected = false,
  variant = 'solid',
  disabled = false,
  onPress,
}: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.chip,
        selected && (variant === 'solid' ? styles.solidSelected : styles.softSelected),
        pressed && styles.pressed,
      ]}>
      {icon}
      <Text
        style={[
          styles.label,
          selected && (variant === 'solid' ? styles.solidSelectedLabel : styles.softSelectedLabel),
          disabled && styles.disabledLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  solidSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  softSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primarySoft,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: 600,
  },
  solidSelectedLabel: {
    color: Colors.onPrimary,
    fontWeight: 700,
  },
  softSelectedLabel: {
    color: Colors.primary,
    fontWeight: 700,
  },
  disabledLabel: {
    color: '#A1A4AA',
  },
});
