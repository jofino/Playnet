import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { MatchCard } from '@/components/matches/match-card';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SportChips } from '@/components/sport-chips';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useUserActivity } from '@/hooks/use-user-activity';

/** Histórico de jogos de um usuário, com filtro por esporte. */
export default function JogosScreen() {
  useLightStatusBar();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { played, loading, error, reload } = useUserActivity(id);
  const [sport, setSport] = useState<Sport | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function pullToRefresh() {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }

  const visible = played.filter((match) => !sport || match.sport === sport);

  return (
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

      <View style={[styles.section, styles.list]}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.message} />
        ) : error ? (
          <View style={styles.message}>
            <Text style={styles.emptyText}>{error}</Text>
            <Button label="Tentar de novo" size="small" variant="outline" onPress={reload} />
          </View>
        ) : visible.length > 0 ? (
          <>
            <Text style={styles.count}>
              {visible.length} {visible.length === 1 ? 'jogo' : 'jogos'}
            </Text>
            {visible.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </>
        ) : (
          <Text style={[styles.emptyText, styles.message]}>
            {sport ? `Nenhum jogo de ${sport} ainda.` : 'Nenhum jogo ainda.'}
          </Text>
        )}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: Spacing.four,
  },
  list: {
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.four,
  },
  count: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 800,
  },
  message: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
});
