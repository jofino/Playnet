import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { MatchCard } from '@/components/matches/match-card';
import { ScheduleMatchSheet } from '@/components/matches/schedule-match-sheet';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SportChips } from '@/components/sport-chips';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { byDate, isFinished, openSpots } from '@/data/matches';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useNow } from '@/hooks/use-now';
import { useMatchesStore } from '@/state/matches-context';

/** Encontrar partida: próximas partidas, com filtro por esporte e por vagas. */
export default function PartidasScreen() {
  useLightStatusBar();
  const router = useRouter();
  const { matches, loading, error, refresh, createMatch } = useMatchesStore();
  const [sport, setSport] = useState<Sport | null>(null);
  const [onlyOpen, setOnlyOpen] = useState(true);
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
  const visible = matches
    .filter((m) => !isFinished(m, now))
    .filter((m) => !sport || m.sport === sport)
    .filter((m) => !onlyOpen || openSpots(m) > 0)
    .sort(byDate);

  return (
    <View style={styles.screen}>
      <ScreenScrollView
        withTabBar={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={pullToRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>
        <SportChips value={sport} onChange={setSport} allLabel="Todos" style={styles.section} />
        <View style={[styles.section, styles.row]}>
          <Chip label="Só com vagas" variant="soft" selected={onlyOpen} onPress={() => setOnlyOpen(!onlyOpen)} />
          <Button label="Marcar partida" size="small" onPress={() => setScheduling(true)} style={styles.create} />
        </View>

        {!loading && !error && (
          <View style={[styles.section, styles.listHeader]}>
            <Text style={styles.count}>
              {visible.length} {visible.length === 1 ? 'partida' : 'partidas'}
            </Text>
          </View>
        )}

        <View style={[styles.section, styles.list]}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={styles.empty} />
          ) : error ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{error}</Text>
              <Button label="Tentar de novo" size="small" variant="outline" onPress={refresh} />
            </View>
          ) : visible.length > 0 ? (
            visible.map((match) => <MatchCard key={match.id} match={match} />)
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nenhuma partida encontrada</Text>
              <Text style={styles.emptyText}>Mude os filtros ou marque você mesmo uma partida.</Text>
            </View>
          )}
        </View>
      </ScreenScrollView>

      {scheduling && (
        <ScheduleMatchSheet
          initialSport={sport ?? undefined}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  create: {
    marginLeft: 'auto',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
  },
  count: {
    flexShrink: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: 800,
  },
  list: {
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.three - Spacing.one,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.one,
    marginTop: Spacing.four,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: 700,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
