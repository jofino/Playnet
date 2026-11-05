import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Ação à direita, ex.: "Ver todos". */
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Título de seção com subtítulo e ação opcionais. */
export function SectionHeader({ title, subtitle, actionLabel, onAction, style }: SectionHeaderProps) {
  return (
    <View style={style}>
      <View style={styles.row}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {actionLabel && onAction && (
          <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.action}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  title: {
    flexShrink: 1,
    color: Colors.text,
    fontSize: 19,
    fontWeight: 800,
  },
  action: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: 700,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.one,
  },
});
