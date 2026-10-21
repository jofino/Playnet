import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ScoreSheet } from '@/components/matches/score-sheet';
import { PlayerChip } from '@/components/player-chip';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SportIcon } from '@/components/sport-icon';
import { describeFormat, getFormat } from '@/constants/scoring';
import { Colors, Spacing } from '@/constants/theme';
import { formatSide, isFinished, isMine, openSpots, winnerSide } from '@/data/matches';
import { ME } from '@/data/players';
import { getVenue } from '@/data/venues';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useReportMatch } from '@/hooks/use-report-match';
import { useMatchesStore } from '@/state/matches-context';
import { formatMatchDate } from '@/utils/date';

/** Detalhe da partida: regras, lados, placar e ações (entrar, sair, registrar resultado). */
export default function PartidaScreen() {
  useLightStatusBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { matches, joinMatch, leaveMatch } = useMatchesStore();
  const reportMatch = useReportMatch();
  const [scoring, setScoring] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const match = matches.find((item) => item.id === id);
  if (!match) {
    return (
      <View style={styles.missing}>
        <Text style={styles.emptyTitle}>Partida não encontrada</Text>
      </View>
    );
  }

  const format = getFormat(match.sport, match.formatId);
  const venue = getVenue(match.venueId);
  const finished = isFinished(match);
  const mine = isMine(match);
  const spots = openSpots(match);
  const winner = winnerSide(match);
  const sideLabels: [string, string] = [
    formatSide(match.sides[0], match.playersPerSide),
    formatSide(match.sides[1], match.playersPerSide),
  ];

  function save(result: Parameters<typeof reportMatch>[1], winnerIndex: 0 | 1) {
    if (!match) return;
    const rating = reportMatch(match, result, winnerIndex);
    const mySide = match.sides.findIndex((side) => side.includes(ME));
    const outcome = mySide < 0 ? 'Resultado salvo.' : winnerIndex === mySide ? 'Vitória registrada! 🎉' : 'Derrota registrada.';
    if (rating?.counted) {
      const delta = rating.after - rating.before;
      setFeedback(
        `${outcome} Seu rating no ${match.sport}: ${rating.before} → ${rating.after} (${delta >= 0 ? '+' : ''}${delta}).`
      );
    } else if (rating) {
      setFeedback(`${outcome} Faça o nivelamento no ${match.sport} (aba Perfil) para seus resultados contarem no rating.`);
    } else {
      setFeedback(outcome);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenScrollView withTabBar={false}>
        <View style={[styles.section, styles.hero]}>
          <View style={styles.heroIcon}>
            <SportIcon sport={match.sport} size={34} />
          </View>
          <View style={styles.heroTexts}>
            <Text style={styles.sport}>
              {match.sport} · {match.playersPerSide === 2 ? 'Duplas' : 'Simples'}
            </Text>
            <Text style={styles.date}>{formatMatchDate(match.date)}</Text>
            {venue && (
              <Text style={styles.venue}>
                📍 {venue.name} · {venue.neighborhood}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.section, styles.card]}>
          <Text style={styles.cardTitle}>{format.label}</Text>
          <Text style={styles.cardText}>{describeFormat(format)}</Text>
        </View>

        <View style={[styles.section, styles.sides]}>
          {match.sides.map((side, sideIndex) => (
            <View key={sideIndex} style={[styles.side, winner === sideIndex && styles.sideWinner]}>
              <Text style={styles.sideTitle}>
                {winner === sideIndex ? '🏆 Vencedor' : `Lado ${sideIndex + 1}`}
              </Text>
              {side.map((name) => (
                <PlayerChip key={name} name={name} size="small" />
              ))}
              {Array.from({ length: match.playersPerSide - side.length }, (_, index) => (
                <Text key={`vaga-${index}`} style={styles.openSpot}>
                  Vaga aberta
                </Text>
              ))}
            </View>
          ))}
        </View>

        {match.result && (
          <View style={[styles.section, styles.card]}>
            <Text style={styles.cardTitle}>Placar</Text>
            {match.result.map(([a, b], index) => (
              <View key={index} style={styles.scoreRow}>
                <Text style={styles.scoreSet}>{index + 1}º set</Text>
                <Text style={[styles.score, a > b && styles.scoreWin]}>{a}</Text>
                <Text style={styles.scoreDash}>–</Text>
                <Text style={[styles.score, b > a && styles.scoreWin]}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        {feedback && (
          <View style={[styles.section, styles.feedback]}>
            <Text style={styles.feedbackText} accessibilityLiveRegion="polite">
              {feedback}
            </Text>
          </View>
        )}

        <View style={[styles.section, styles.actions]}>
          {!finished && !mine && spots > 0 && (
            <Button label="Entrar na partida" onPress={() => joinMatch(match.id)} />
          )}
          {!finished && mine && (
            <Button label="Sair da partida" variant="outline" onPress={() => leaveMatch(match.id)} />
          )}
          {finished && mine && !match.result && (
            <Button label="Registrar resultado" onPress={() => setScoring(true)} />
          )}
          {!finished && !mine && spots === 0 && <Text style={styles.note}>Partida completa.</Text>}
          {finished && !match.result && !mine && (
            <Text style={styles.note}>Aguardando os jogadores registrarem o placar.</Text>
          )}
        </View>
      </ScreenScrollView>

      {scoring && (
        <ScoreSheet
          sport={match.sport}
          formatId={match.formatId}
          sideLabels={sideLabels}
          subtitle={formatMatchDate(match.date)}
          onClose={() => setScoring(false)}
          onSave={save}
        />
      )}
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
  sides: {
    flexDirection: 'row',
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.four,
  },
  side: {
    flex: 1,
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: Colors.backgroundElement,
  },
  sideWinner: {
    backgroundColor: Colors.primarySoft,
  },
  sideTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  openSpot: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 700,
    paddingVertical: Spacing.one,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  scoreSet: {
    width: 64,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: 600,
  },
  score: {
    width: 32,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 20,
    fontWeight: 700,
  },
  scoreWin: {
    color: Colors.primary,
    fontWeight: 800,
  },
  scoreDash: {
    color: Colors.textSecondary,
    fontSize: 16,
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
