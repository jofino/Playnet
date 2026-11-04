import { Pressable, StyleSheet, Text } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Colors, Spacing } from '@/constants/theme';
import { useOpenUserProfile } from '@/hooks/use-open-profile';
import type { Profile } from '@/lib/perfis';

/** Linha de uma lista de usuários; o toque abre o perfil. */
export function UserRow({ user }: { user: Profile }) {
  const openProfile = useOpenUserProfile();

  return (
    <Pressable
      onPress={() => openProfile(user.id)}
      accessibilityRole="link"
      accessibilityLabel={`Ver perfil de ${user.name}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Avatar name={user.name} size={44} />
      <Text style={styles.name} numberOfLines={1}>
        {user.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  name: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: 700,
  },
});
