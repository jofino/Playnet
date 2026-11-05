import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SportIcon } from '@/components/sport-icon';
import { getFormat } from '@/constants/scoring';
import { Colors, Spacing } from '@/constants/theme';
import { tournamentStatus, type Tournament } from '@/data/tournaments';
import { getVenue } from '@/data/venues';
import { formatMatchDate } from '@/utils/date';

type TournamentCardProps = {
  tournament: Tournament;
  /** Versão estreita para carrosséis horizontais. */
  compact?: boolean;
};

/** Cartão de torneio (abre o detalhe ao tocar). */
export function TournamentCard({ tournament, compact = false }: TournamentCardProps) {
  const router = useRouter();
  const status = tournamentStatus(tournament);
  const unit = tournament.playersPerSide === 2 ? 'duplas' : 'jogadores';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/torneio/[id]', params: { id: tournament.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${tournament.name}, ${status}`}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}>
      <View style={styles.headerRow}>
        <View style={styles.trophy}>
          <SportIcon sport={tournament.sport} size={22} />
        </View>
        <Text style={[styles.status, status === 'Inscrições abertas' && styles.statusOpen]}>{status}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {tournament.name}
      </Text>
      <Text style={styles.date}>{formatMatchDate(tournament.date)}</Text>
      <Text style={styles.detail} numberOfLines={1}>
        📍 {getVenue(tournament.venueId)?.name}
      </Text>
      <Text style={styles.detail} numberOfLines={1}>
        👥 {tournament.entries.length}/{tournament.maxEntries} {unit} ·{' '}
        {getFormat(tournament.sport, tournament.formatId).label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
  },
  compact: {
    width: 260,
  },
  pressed: {
    opacity: 0.8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  trophy: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  status: {
    color: Colors.textSecondary,
    backgroundColor: Colors.backgroundElement,
    fontSize: 11,
    fontWeight: 800,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    overflow: 'hidden',
  },
  statusOpen: {
    color: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 800,
  },
  date: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 700,
  },
  detail: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
