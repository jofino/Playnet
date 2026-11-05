import { Pressable, StyleSheet, Text } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Colors, Spacing } from '@/constants/theme';
import { ME } from '@/data/players';
import { hasProfile, useOpenProfile, useOpenUserProfile } from '@/hooks/use-open-profile';
import { useUser } from '@/state/user-context';

type PlayerChipProps = {
  name: string;
  /** Id do usuário real; sem ele, o perfil é procurado pelo nome. */
  userId?: string;
  /** Texto extra à direita do nome, ex.: rating. */
  detail?: string;
  size?: 'small' | 'regular';
};

/** Avatar + nome que abre o perfil do jogador. */
export function PlayerChip({ name, userId, detail, size = 'regular' }: PlayerChipProps) {
  const openProfile = useOpenProfile();
  const openUserProfile = useOpenUserProfile();
  const { user } = useUser();
  const isMe = userId ? userId === user.id : name === ME;
  const avatarSize = size === 'small' ? 28 : 36;

  return (
    <Pressable
      onPress={() => (userId ? openUserProfile(userId) : openProfile(name))}
      disabled={!userId && !hasProfile(name)}
      accessibilityRole="link"
      accessibilityLabel={`Ver perfil de ${isMe ? 'você' : name}`}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
      <Avatar name={isMe ? user.name : name} size={avatarSize} photoUri={isMe ? user.photoUri : null} />
      <Text style={[styles.name, size === 'small' && styles.small]} numberOfLines={2}>
        {isMe ? ME : name}
      </Text>
      {detail && <Text style={styles.detail}>{detail}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flexShrink: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 700,
    flexShrink: 1,
  },
  small: {
    fontSize: 14,
  },
  detail: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: 600,
  },
});
