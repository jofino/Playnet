import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { MatchCard } from '@/components/matches/match-card';
import { ScheduleMatchSheet } from '@/components/matches/schedule-match-sheet';
import { QuickAction } from '@/components/quick-action';
import { ScreenHeader } from '@/components/screen-header';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SectionHeader } from '@/components/section-header';
import { Colors, Spacing } from '@/constants/theme';
import { byDate, isFinished, isMine, openSpots } from '@/data/matches';
import { useNow } from '@/hooks/use-now';
import { useMatchesStore } from '@/state/matches-context';
import { useUser } from '@/state/user-context';

/** Aba central: tudo para entrar em quadra — partidas, torneios e aulas. */
export default function JogarScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { matches, loading, error, refresh, createMatch } = useMatchesStore();
  const [scheduling, setScheduling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Partidas criadas por outras pessoas aparecem ao voltar para a tela.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  async function pullToRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  const now = useNow();
  const myUpcoming = matches.filter((m) => isMine(m, user.id) && !isFinished(m, now)).sort(byDate);
  const withSpots = matches
    .filter((m) => !isMine(m, user.id) && !isFinished(m, now) && openSpots(m) > 0)
    .sort(byDate);
  
  return (
    <View style={styles.screen}>
      <ScreenHeader title="Jogar" />

      <ScreenScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={pullToRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>
        <Text style={[styles.section, styles.greeting]}>Bora jogar, {user.name.split(' ')[0]}?</Text>
        <View style={[styles.section, styles.quickActions]}>
          <QuickAction
            label="Marcar partida"
            icon={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
            onPress={() => setScheduling(true)}
          />
          <QuickAction
            label="Encontrar partida"
            icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            onPress={() => router.push('/partidas')}
          />
          <QuickAction
            label="Aprender"
            icon={{ ios: 'graduationcap.fill', android: 'school', web: 'school' }}
            onPress={() => router.push('/aprender')}
          />
          <QuickAction
            label="Torneios"
            icon={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
            onPress={() => router.push('/torneios')}
          />
        </View>

        {myUpcoming.length > 0 && (
          <>
            <SectionHeader title="Suas próximas partidas" style={[styles.section, styles.sectionSpacing]} />
            <View style={[styles.section, styles.list]}>
              {myUpcoming.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </View>
          </>
        )}

        <SectionHeader
          title="Partidas com vagas"
          actionLabel="Ver todas"
          onAction={() => router.push('/partidas')}
          style={[styles.section, styles.sectionSpacing]}
        />
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : error ? (
          <View style={[styles.section, styles.empty]}>
            <Text style={styles.emptyText}>{error}</Text>
            <Button label="Tentar de novo" size="small" variant="outline" onPress={refresh} />
          </View>
        ) : withSpots.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {withSpots.map((match) => (
              <MatchCard key={match.id} match={match} compact />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.section, styles.empty]}>
            <Text style={styles.emptyText}>Nenhuma partida com vagas agora.</Text>
            <Button label="Marcar uma partida" size="small" onPress={() => setScheduling(true)} />
          </View>
        )}

        <SectionHeader
          title="Torneios"
          actionLabel="Ver todos"
          onAction={() => router.push('/torneios')}
          style={[styles.section, styles.sectionSpacing]}
        />
        <View style={[styles.section, styles.empty]}>
          <Text style={styles.emptyText}>Nenhum torneio disponível por enquanto</Text>
        </View>

        <SectionHeader title="Aulas" style={[styles.section, styles.sectionSpacing]} />
        <View style={[styles.section, styles.empty]}>
          <Text style={styles.emptyText}>Nenhuma aula disponível por enquanto</Text>
        </View>
      </ScreenScrollView>

      {scheduling && (
        <ScheduleMatchSheet
          onClose={() => setScheduling(false)}
          onSchedule={async (match) => {
            const id = await createMatch(match);
            router.push({ pathname: '/partida/[id]', params: { id } });
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
  sectionSpacing: {
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
  },
  greeting: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: 800,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  list: {
    gap: Spacing.three - Spacing.one,
  },
  carousel: {
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.one,
  },
  empty: {
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
