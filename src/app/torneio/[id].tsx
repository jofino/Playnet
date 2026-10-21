import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ScoreSheet } from '@/components/matches/score-sheet';
import { PlayerChip } from '@/components/player-chip';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SectionHeader } from '@/components/section-header';
import { SportIcon } from '@/components/sport-icon';
import { BracketView } from '@/components/tournaments/bracket-view';
import { EntrySheet } from '@/components/tournaments/entry-sheet';
import { describeFormat, getFormat, type SetScore } from '@/constants/scoring';
import { Colors, Spacing } from '@/constants/theme';
import { formatSide } from '@/data/matches';
import { ME } from '@/data/players';
import { tournamentStatus } from '@/data/tournaments';
import { getVenue } from '@/data/venues';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useRatingUpdate } from '@/hooks/use-rating-update';
import { useTournaments } from '@/state/tournaments-context';
import { bracketChampion } from '@/utils/bracket';
import { formatMatchDate } from '@/utils/date';

type OpenSheet = { kind: 'register' } | { kind: 'addEntry' } | { kind: 'score'; round: number; match: number } | null;

export default function TorneioScreen() {
  useLightStatusBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tournaments, addEntry, removeEntry, generateBracket, recordResult } = useTournaments();
  const { applyResult } = useRatingUpdate();
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const tournament = tournaments.find((item) => item.id === id);
  if (!tournament) {
    return (
      <View style={styles.missing}>
        <Text style={styles.title}>Torneio não encontrado</Text>
      </View>
    );
  }

  const status = tournamentStatus(tournament);
  const format = getFormat(tournament.sport, tournament.formatId);
  const venue = getVenue(tournament.venueId);
  const isOrganizer = tournament.organizer === ME;
  const myEntry = tournament.entries.find((entry) => entry.includes(ME));
  const registered = tournament.entries.flat();
  const unit = tournament.playersPerSide === 2 ? 'duplas' : 'jogadores';
  const champion = tournament.bracket ? bracketChampion(tournament.bracket) : undefined;
  const entryName = (index: number) => formatSide(tournament.entries[index], tournament.playersPerSide);

  function saveScore(round: number, matchIndex: number, result: SetScore[], winnerSlot: 0 | 1) {
    if (!tournament?.bracket) return;
    const slots = tournament.bracket[round][matchIndex].slots;
    recordResult(tournament.id, round, matchIndex, result, winnerSlot);

    // Jogos do próprio usuário no torneio também contam para o rating dele.
    const mySlot = slots.findIndex((slot) => slot !== null && tournament.entries[slot].includes(ME));
    if (mySlot >= 0) {
      const opponents = tournament.entries[slots[1 - mySlot] as number];
      const rating = applyResult({
        sport: tournament.sport,
        opponents,
        won: mySlot === winnerSlot,
        matchId: `${tournament.id}-${round}-${matchIndex}`,
      });
      if (rating.counted) {
        setFeedback(`Seu rating no ${tournament.sport}: ${rating.before} → ${rating.after}.`);
      }
    }
  }

  const scoring = sheet?.kind === 'score' ? tournament.bracket?.[sheet.round][sheet.match] : undefined;

  return (
    <View style={styles.screen}>
      <ScreenScrollView withTabBar={false}>
        <View style={[styles.section, styles.hero]}>
          <View style={styles.heroIcon}>
            <SportIcon sport={tournament.sport} size={34} />
          </View>
          <View style={styles.heroTexts}>
            <Text style={styles.title}>{tournament.name}</Text>
            <Text style={[styles.status, status === 'Inscrições abertas' && styles.statusOpen]}>{status}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.info]}>
          <Text style={styles.infoLine}>📅 {formatMatchDate(tournament.date)}</Text>
          {venue && (
            <Text style={styles.infoLine}>
              📍 {venue.name} · {venue.neighborhood}
            </Text>
          )}
          <Text style={styles.infoLine}>
            👥 {tournament.sport} · {tournament.playersPerSide === 2 ? 'Duplas' : 'Simples'} · até{' '}
            {tournament.maxEntries} {unit}
          </Text>
          <View style={styles.organizer}>
            <Text style={styles.infoLine}>Organização:</Text>
            <PlayerChip name={tournament.organizer} size="small" />
          </View>
        </View>

        <View style={[styles.section, styles.card]}>
          <Text style={styles.cardTitle}>Jogos: {format.label}</Text>
          <Text style={styles.cardText}>{describeFormat(format)} Mata-mata: quem perde é eliminado.</Text>
        </View>

        {champion !== undefined && (
          <View style={[styles.section, styles.champion]}>
            <Text style={styles.championLabel}>🏆 Campeão</Text>
            <Text style={styles.championName}>{entryName(champion)}</Text>
          </View>
        )}

        {feedback && (
          <View style={[styles.section, styles.feedback]}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        <View style={[styles.section, styles.actions]}>
          {!tournament.bracket && !myEntry && status === 'Inscrições abertas' && (
            <Button
              label={tournament.playersPerSide === 2 ? 'Inscrever minha dupla' : 'Inscrever-se'}
              onPress={() => setSheet({ kind: 'register' })}
            />
          )}
          {!tournament.bracket && myEntry && (
            <Button label="Cancelar inscrição" variant="outline" onPress={() => removeEntry(tournament.id, ME)} />
          )}
          {isOrganizer && !tournament.bracket && (
            <>
              {tournament.entries.length < tournament.maxEntries && (
                <Button label="Adicionar participante" variant="outline" onPress={() => setSheet({ kind: 'addEntry' })} />
              )}
              <Button
                label="Gerar chaveamento"
                onPress={() => generateBracket(tournament.id)}
                disabled={tournament.entries.length < 2}
              />
              <Text style={styles.note}>
                O chaveamento usa o rating para definir os cabeças de chave. Depois de gerado, as inscrições fecham.
              </Text>
            </>
          )}
        </View>

        {tournament.bracket ? (
          <>
            <SectionHeader
              title="Chaveamento"
              subtitle={isOrganizer ? 'Toque em "Registrar placar" quando um jogo terminar.' : undefined}
              style={[styles.section, styles.sectionSpacing]}
            />
            <BracketView
              tournament={tournament}
              onReport={isOrganizer ? (round, match) => setSheet({ kind: 'score', round, match }) : undefined}
            />
          </>
        ) : (
          <Text style={[styles.section, styles.note, styles.sectionSpacing]}>
            O chaveamento será divulgado pela organização quando as inscrições fecharem.
          </Text>
        )}

        <SectionHeader
          title={`Inscritos (${tournament.entries.length}/${tournament.maxEntries})`}
          style={[styles.section, styles.sectionSpacing]}
        />
        <View style={[styles.section, styles.entries]}>
          {tournament.entries.length === 0 && <Text style={styles.note}>Ninguém inscrito ainda.</Text>}
          {tournament.entries.map((entry, index) => (
            <View key={index} style={styles.entry}>
              <Text style={styles.entryNumber}>{index + 1}</Text>
              <View style={styles.entryPlayers}>
                {entry.map((name) => (
                  <PlayerChip key={name} name={name} size="small" />
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScreenScrollView>

      {sheet?.kind === 'register' && (
        <EntrySheet
          title={tournament.playersPerSide === 2 ? 'Inscrever minha dupla' : 'Inscrição'}
          sport={tournament.sport}
          playersPerSide={tournament.playersPerSide}
          includeMe
          excluded={registered}
          onClose={() => setSheet(null)}
          onConfirm={(entry) => addEntry(tournament.id, entry)}
        />
      )}
      {sheet?.kind === 'addEntry' && (
        <EntrySheet
          title="Adicionar participante"
          sport={tournament.sport}
          playersPerSide={tournament.playersPerSide}
          includeMe={false}
          excluded={registered}
          onClose={() => setSheet(null)}
          onConfirm={(entry) => addEntry(tournament.id, entry)}
        />
      )}
      {sheet?.kind === 'score' && scoring && (
        <ScoreSheet
          sport={tournament.sport}
          formatId={tournament.formatId}
          sideLabels={[entryName(scoring.slots[0] as number), entryName(scoring.slots[1] as number)]}
          subtitle={tournament.name}
          onClose={() => setSheet(null)}
          onSave={(result, winner) => saveScore(sheet.round, sheet.match, result, winner)}
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
  sectionSpacing: {
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
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
    gap: Spacing.one,
    alignItems: 'flex-start',
  },
  title: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 800,
  },
  status: {
    color: Colors.textSecondary,
    backgroundColor: Colors.backgroundElement,
    fontSize: 12,
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
  info: {
    gap: Spacing.one,
    marginTop: Spacing.four,
  },
  infoLine: {
    color: Colors.text,
    fontSize: 14,
  },
  organizer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
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
    fontSize: 15,
    fontWeight: 800,
  },
  cardText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  champion: {
    marginTop: Spacing.four,
    marginHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    gap: Spacing.one,
  },
  championLabel: {
    color: Colors.onPrimary,
    fontSize: 14,
    fontWeight: 700,
  },
  championName: {
    color: Colors.onPrimary,
    fontSize: 18,
    fontWeight: 800,
    textAlign: 'center',
  },
  feedback: {
    marginTop: Spacing.three,
    marginHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: 14,
    backgroundColor: '#FDF3F0',
  },
  feedbackText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 600,
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  note: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  entries: {
    gap: Spacing.two,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three - Spacing.one,
    borderRadius: 12,
    backgroundColor: Colors.backgroundElement,
  },
  entryNumber: {
    width: 20,
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: 800,
    textAlign: 'center',
  },
  entryPlayers: {
    flex: 1,
    gap: Spacing.two,
  },
});
