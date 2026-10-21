import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SportChips } from '@/components/sport-chips';
import { CreateTournamentSheet } from '@/components/tournaments/create-tournament-sheet';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { ME } from '@/data/players';
import { tournamentStatus, type TournamentStatus } from '@/data/tournaments';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTournaments } from '@/state/tournaments-context';

// Ordem de exibição: o que ainda dá para se inscrever vem primeiro.
const STATUS_ORDER: TournamentStatus[] = ['Inscrições abertas', 'Em andamento', 'Inscrições encerradas', 'Encerrado'];

export default function TorneiosScreen() {
  useLightStatusBar();
  const router = useRouter();
  const { tournaments, createTournament } = useTournaments();
  const [sport, setSport] = useState<Sport | null>(null);
  const [creating, setCreating] = useState(false);

  const visible = tournaments
    .filter((t) => !sport || t.sport === sport)
    .sort(
      (a, b) =>
        STATUS_ORDER.indexOf(tournamentStatus(a)) - STATUS_ORDER.indexOf(tournamentStatus(b)) ||
        a.date.localeCompare(b.date)
    );

  return (
    <View style={styles.screen}>
      <ScreenScrollView withTabBar={false}>
        <View style={[styles.section, styles.intro]}>
          <Text style={styles.introText}>Dispute torneios na sua região ou organize o seu.</Text>
          <Button label="Criar torneio" size="small" onPress={() => setCreating(true)} />
        </View>
        <SportChips value={sport} onChange={setSport} allLabel="Todos" style={[styles.section, styles.filters]} />
        <View style={[styles.section, styles.list]}>
          {visible.length > 0 ? (
            visible.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)
          ) : (
            <Text style={styles.empty}>Nenhum torneio deste esporte por enquanto. Que tal criar um?</Text>
          )}
        </View>
      </ScreenScrollView>

      {creating && (
        <CreateTournamentSheet
          onClose={() => setCreating(false)}
          onCreate={(tournament, firstEntry) => {
            const id = createTournament(tournament, ME, firstEntry);
            router.push({ pathname: '/torneio/[id]', params: { id } });
          }}
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
  section: {
    paddingHorizontal: Spacing.four,
  },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  introText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  filters: {
    marginTop: Spacing.three,
  },
  list: {
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.four,
  },
  empty: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.four,
  },
});
