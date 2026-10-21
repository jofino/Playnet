import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type QuickActionProps = {
  label: string;
  icon: SymbolViewProps['name'];
  onPress: () => void;
};

/** Atalho redondo com ícone e rótulo embaixo (topo da aba Jogar). */
export function QuickAction({ label, icon, onPress }: QuickActionProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <View style={styles.circle}>
        <SymbolView name={icon} tintColor={Colors.onPrimary} size={30} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
  circle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(224, 84, 52, 0.3)',
  },
  label: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
  },
});
