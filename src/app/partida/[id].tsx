import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { PlayerChip } from '@/components/player-chip';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SportIcon } from '@/components/sport-icon';
import { Colors, Spacing } from '@/constants/theme';
import { isFinished, openSpots, type Match } from '@/data/matches';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useMatchAction } from '@/hooks/use-match-action';
import { fetchMatch, getMatchErrorMessage } from '@/lib/partidas';
import { useMatchesStore } from '@/state/matches-context';
import { formatMatchDate } from '@/utils/date';

/** Detalhe da partida: local, nível, participantes e as ações de entrar e sair. */
export default function PartidaScreen() {
  useLightStatusBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches } = useMatchesStore();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A lista do contexto muda depois de entrar ou sair, e aí o detalhe também precisa atualizar.
  useEffect(() => {
    let active = true;

    fetchMatch(id)
      .then((next) => {
        if (!active) return;
        setMatch(next);
        setError(null);
      })
      .catch((failure) => {
        if (active) setError(getMatchErrorMessage(failure));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, matches]);

  if (loading) {
    return (
      <View style={styles.missing}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (error && !match) {
    return (
      <View style={styles.missing}>
        <Text style={styles.note}>{error}</Text>
      </View>
    );
  }
  if (!match) {
    return (
      <View style={styles.missing}>
        <Text style={styles.emptyTitle}>Partida não encontrada</Text>
      </View>
    );
  }

  return <MatchDetail match={match} />;
}

function MatchDetail({ match }: { match: Match }) {
  const { mine, canJoin, canLeave, busy, error, join, leave } = useMatchAction(match);
  const finished = isFinished(match);
  const spots = openSpots(match);

  return (
    <View style={styles.screen}>
      <ScreenScrollView withTabBar={false}>
        <View style={[styles.section, styles.hero]}>
          <View style={styles.heroIcon}>
            <SportIcon sport={match.sport} size={34} />
          </View>
          <View style={styles.heroTexts}>
            <Text style={styles.sport}>{match.sport}</Text>
            <Text style={styles.date}>{formatMatchDate(match.date)}</Text>
            <Text style={styles.venue}>
              📍 {match.place} · {match.city}
            </Text>
          </View>
        </View>

        <View style={[styles.section, styles.card]}>
          <Text style={styles.cardTitle}>Nível</Text>
          <Text style={styles.cardText}>{match.level}</Text>
        </View>

        <View style={[styles.section, styles.card]}>
          <Text style={styles.cardTitle}>
            Participantes ({match.participants.length} de {match.spots})
          </Text>
          <View style={styles.participants}>
            {match.participants.map((participant) => (
              <PlayerChip
                key={participant.id}
                name={participant.name}
                userId={participant.id}
                size="small"
              />
            ))}
            {!finished && spots > 0 && (
              <Text style={styles.openSpot}>
                {spots} {spots === 1 ? 'vaga aberta' : 'vagas abertas'}
              </Text>
            )}
          </View>
        </View>

        {!!error && (
          <View style={[styles.section, styles.feedback]}>
            <Text style={styles.feedbackText} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {error}
            </Text>
          </View>
        )}

        <View style={[styles.section, styles.actions]}>
          {canJoin && (
            <Button
              label="Entrar na partida"
              onPress={join}
              disabled={busy}
              icon={busy ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : undefined}
            />
          )}
          {canLeave && (
            <Button
              label="Sair da partida"
              variant="outline"
              onPress={leave}
              disabled={busy}
              icon={busy ? <ActivityIndicator size="small" color={Colors.primary} /> : undefined}
            />
          )}
          {!finished && !mine && spots === 0 && <Text style={styles.note}>Partida completa.</Text>}
          {finished && <Text style={styles.note}>Partida encerrada.</Text>}
        </View>
      </ScreenScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  missing: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: Colors.background,
  },
  section: {
    paddingHorizontal: Spacing.four,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTexts: {
    flex: 1,
    gap: Spacing.half,
  },
  sport: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 800,
  },
  date: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: 700,
  },
  venue: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  card: {
    marginTop: Spacing.four,
    marginHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 800,
  },
  cardText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  participants: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  openSpot: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 700,
    paddingVertical: Spacing.one,
  },
  feedback: {
    marginTop: Spacing.four,
    marginHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 14,
    backgroundColor: '#FDF3F0',
  },
  feedbackText: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 600,
  },
  actions: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  note: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: 700,
  },
});
