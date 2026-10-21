import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SportIcon } from '@/components/sport-icon';
import { getFormat } from '@/constants/scoring';
import { Colors, Spacing } from '@/constants/theme';
import { formatSide, isFinished, isMine, openSpots, winnerSide, type Match } from '@/data/matches';
import { getVenue } from '@/data/venues';
import { formatMatchDate } from '@/utils/date';

type MatchCardProps = {
  match: Match;
  /** Botão exibido à direita (ex.: "Registrar"). */
  action?: ReactNode;
  /** Versão estreita para carrosséis horizontais. */
  compact?: boolean;
};

/** Cartão de partida (abre o detalhe ao tocar). */
export function MatchCard({ match, action, compact = false }: MatchCardProps) {
  const router = useRouter();
  const venue = getVenue(match.venueId);
  const spots = openSpots(match);
  const finished = isFinished(match);
  const winner = winnerSide(match);
  const mine = isMine(match);

  const badge = mine
    ? 'Sua partida'
    : finished
      ? 'Encerrada'
      : spots > 0
        ? `${spots} ${spots === 1 ? 'vaga' : 'vagas'}`
        : 'Completa';

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/partida/[id]', params: { id: match.id } })}
      accessibilityRole="button"
      accessibilityLabel={`Partida de ${match.sport}, ${formatMatchDate(match.date)}, ${badge}`}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}>
      <View style={styles.texts}>
        <View style={styles.headerRow}>
          <SportIcon sport={match.sport} size={20} />
          <Text style={styles.sport} numberOfLines={1}>
            {match.sport}
          </Text>
          <Text style={[styles.badge, (mine || (spots > 0 && !finished)) && styles.badgeAccent]}>
            {badge}
          </Text>
        </View>
        <Text style={styles.date}>{formatMatchDate(match.date)}</Text>
        {venue && (
          <Text style={styles.detail} numberOfLines={1}>
            📍 {venue.name}
          </Text>
        )}
        <Text style={styles.detail} numberOfLines={compact ? 2 : 3}>
          👥 <Text style={winner === 0 && styles.winner}>{formatSide(match.sides[0], match.playersPerSide)}</Text>
          {' x '}
          <Text style={winner === 1 && styles.winner}>{formatSide(match.sides[1], match.playersPerSide)}</Text>
        </Text>
        {match.result ? (
          <Text style={styles.result}>Placar: {match.result.map(([a, b]) => `${a}-${b}`).join('  ')}</Text>
        ) : (
          !compact && <Text style={styles.format}>{getFormat(match.sport, match.formatId).label}</Text>
        )}
      </View>
      {action}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
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
  texts: {
    flex: 1,
    gap: Spacing.half,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  sport: {
    flexShrink: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: 800,
  },
  badge: {
    marginLeft: 'auto',
    color: Colors.textSecondary,
    backgroundColor: Colors.backgroundElement,
    fontSize: 11,
    fontWeight: 800,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    overflow: 'hidden',
  },
  badgeAccent: {
    color: Colors.primary,
    backgroundColor: Colors.primarySoft,
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
  winner: {
    color: Colors.text,
    fontWeight: 800,
  },
  result: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 700,
    marginTop: Spacing.one,
  },
  format: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: Spacing.one,
  },
});
