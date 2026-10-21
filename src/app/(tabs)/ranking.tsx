import { StyleSheet, Text, View } from 'react-native';

import { RankingRow } from '@/components/ranking/ranking-row';
import { ScreenHeader } from '@/components/screen-header';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SelectField } from '@/components/select-field';
import { SportChips } from '@/components/sport-chips';
import { Colors, Spacing } from '@/constants/theme';
import { RANKED_PLAYERS, STATE_NAMES } from '@/data/ranking';
import { useRankingFilters } from '@/hooks/use-ranking-filters';

export default function RankingScreen() {
  const { filters, stateOptions, cityOptions, ranking, setSport, setState, setCity } =
    useRankingFilters(RANKED_PLAYERS, 'Tênis');

  const regionLabel = filters.city
    ? `${filters.city}, ${filters.state}`
    : filters.state
      ? STATE_NAMES[filters.state]
      : 'Brasil';

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Ranking" />

      <ScreenScrollView>
        <SportChips value={filters.sport} onChange={setSport} style={styles.section} />

        <View style={[styles.section, styles.regionRow]}>
          <View style={styles.regionField}>
            <SelectField
              label="Estado"
              value={filters.state}
              options={stateOptions.map((state) => ({ value: state, label: STATE_NAMES[state] }))}
              allLabel="Todos"
              onChange={setState}
            />
          </View>
          <View style={styles.regionField}>
            <SelectField
              label="Cidade"
              value={filters.city}
              options={cityOptions.map((city) => ({ value: city, label: city }))}
              allLabel="Todas"
              disabled={!filters.state}
              onChange={setCity}
            />
          </View>
        </View>

        <Text style={[styles.section, styles.summary]}>
          {filters.sport} · {regionLabel} · {ranking.length}{' '}
          {ranking.length === 1 ? 'jogador' : 'jogadores'}
        </Text>

        {ranking.length > 0 ? (
          <View style={styles.list}>
            {ranking.map((player, index) => (
              <RankingRow key={player.id} player={player} isLast={index === ranking.length - 1} />
            ))}
          </View>
        ) : (
          <View style={[styles.section, styles.empty]}>
            <Text style={styles.emptyTitle}>Nenhum jogador encontrado</Text>
            <Text style={styles.emptyText}>Tente outro esporte ou outra região.</Text>
          </View>
        )}
      </ScreenScrollView>
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
  regionRow: {
    flexDirection: 'row',
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.three,
  },
  regionField: {
    flex: 1,
  },
  summary: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.four,
  },
  list: {
    marginTop: Spacing.two + Spacing.one,
    marginHorizontal: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  empty: {
    alignItems: 'center',
    marginTop: Spacing.five,
    gap: Spacing.one,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: 700,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
