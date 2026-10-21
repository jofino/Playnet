import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  /** `solid`: laranja cheio. `outline`: contorno laranja. `light`: branco sobre fundo laranja. */
  variant?: 'solid' | 'outline' | 'light';
  size?: 'regular' | 'small';
  disabled?: boolean;
  /** Ícone exibido antes do texto. */
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Botão em formato de pílula usado em todo o app. */
export function Button({
  label,
  onPress,
  variant = 'solid',
  size = 'regular',
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        size === 'small' && styles.small,
        styles[variant],
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      {icon}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          size === 'small' && styles.smallLabel,
          variant === 'solid' ? styles.solidLabel : styles.accentLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  small: {
    height: 34,
    borderRadius: 17,
    paddingHorizontal: Spacing.three,
  },
  solid: {
    backgroundColor: Colors.primary,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  light: {
    backgroundColor: Colors.background,
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontSize: 16,
    fontWeight: 700,
  },
  smallLabel: {
    fontSize: 14,
  },
  solidLabel: {
    color: Colors.onPrimary,
  },
  accentLabel: {
    color: Colors.primary,
  },
});
