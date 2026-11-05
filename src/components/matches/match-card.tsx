import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { SportIcon } from '@/components/sport-icon';
import { Colors, Spacing } from '@/constants/theme';
import { isFinished, matchLevelLabel, openSpots, type Match } from '@/data/matches';
import { useMatchAction } from '@/hooks/use-match-action';
import { formatMatchDate } from '@/utils/date';

type MatchCardProps = {
  match: Match;
  /** Versão estreita para carrosséis horizontais. */
  compact?: boolean;
};

/** Cartão de partida (abre o detalhe ao tocar), com o botão de entrar ou sair. */
export function MatchCard({ match, compact = false }: MatchCardProps) {
  const router = useRouter();
  const { mine, canJoin, canLeave, busy, error, join, leave } = useMatchAction(match);
  const spots = openSpots(match);
  const finished = isFinished(match);

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
      accessibilityLabel={`Partida de ${match.sportName}, ${formatMatchDate(match.date)}, ${badge}`}
      style={({ pressed }) => [styles.card, compact && styles.compact, pressed && styles.pressed]}>
      <View style={styles.headerRow}>
        <SportIcon sport={match.sport} size={20} />
        <Text style={styles.sport} numberOfLines={1}>
          {match.sportName}
        </Text>
        <Text style={[styles.badge, (mine || (spots > 0 && !finished)) && styles.badgeAccent]}>
          {badge}
        </Text>
      </View>
      <Text style={styles.date}>{formatMatchDate(match.date)}</Text>
      <Text style={styles.detail} numberOfLines={1}>
        📍 {match.place} · {match.city}
      </Text>
      <Text style={styles.detail}>
        👥 {match.participants.length} de {match.spots}{' '}
        {match.spots === 1 ? 'participante' : 'participantes'}
      </Text>
      <Text style={styles.level}>{matchLevelLabel(match.level)}</Text>

      {(canJoin || canLeave) && (
        <Button
          label={canJoin ? 'Entrar' : 'Sair'}
          size="small"
          variant={canJoin ? 'solid' : 'outline'}
          onPress={canJoin ? join : leave}
          disabled={busy}
          icon={
            busy ? (
              <ActivityIndicator size="small" color={canJoin ? Colors.onPrimary : Colors.primary} />
            ) : undefined
          }
          style={styles.action}
        />
      )}
      {!!error && (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.half,
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
  level: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: Spacing.one,
  },
  action: {
    marginTop: Spacing.two,
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
    marginTop: Spacing.one,
  },
});
