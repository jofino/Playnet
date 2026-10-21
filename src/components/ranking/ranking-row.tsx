import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Colors, Spacing } from '@/constants/theme';
import type { RankedPlayer } from '@/data/ranking';
import { useOpenProfile } from '@/hooks/use-open-profile';

type RankingRowProps = {
  player: RankedPlayer & { position: number };
  isLast?: boolean;
};

const PODIUM_SIZE = 3;

export function RankingRow({ player, isLast = false }: RankingRowProps) {
  const onPodium = player.position <= PODIUM_SIZE;
  const openProfile = useOpenProfile();

  return (
    <Pressable
      onPress={() => openProfile(player.name)}
      accessibilityRole="button"
      accessibilityLabel={`${player.position}º, ${player.name}, rating ${player.rating}. Ver perfil`}
      style={({ pressed }) => [styles.row, !isLast && styles.divider, pressed && styles.pressed]}>
      <View style={[styles.position, onPodium && styles.podium]}>
        <Text style={[styles.positionText, onPodium && styles.podiumText]}>{player.position}</Text>
      </View>
      <Avatar name={player.name} size={40} />
      <View style={styles.texts}>
        <Text style={styles.name} numberOfLines={1}>
          {player.name}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {player.city}, {player.state}
        </Text>
      </View>
      <View style={styles.rating}>
        <Text style={styles.ratingValue}>{player.rating.toLocaleString('pt-BR')}</Text>
        <Text style={styles.ratingLabel}>rating</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
  },
  pressed: {
    backgroundColor: Colors.backgroundElement,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  position: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podium: {
    backgroundColor: Colors.primary,
  },
  positionText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: 700,
  },
  podiumText: {
    color: Colors.onPrimary,
  },
  texts: {
    flex: 1,
  },
  name: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 700,
  },
  location: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  rating: {
    alignItems: 'flex-end',
  },
  ratingValue: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 800,
  },
  ratingLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: 600,
  },
});
