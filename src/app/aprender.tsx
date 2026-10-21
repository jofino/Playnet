import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { TeacherCard } from '@/components/learn/teacher-card';
import { pinsByVenue, RegionMap } from '@/components/region-map';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SegmentedControl } from '@/components/segmented-control';
import { SportChips } from '@/components/sport-chips';
import { Colors, Spacing } from '@/constants/theme';
import { MOCK_TEACHERS } from '@/data/teachers';
import { getVenue } from '@/data/venues';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTeacherSearch, type TeacherSort } from '@/hooks/use-teacher-search';

type ViewMode = 'list' | 'map';

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'list', label: 'Lista de professores' },
  { value: 'map', label: 'Mapa' },
];

const SORT_OPTIONS: { value: TeacherSort; label: string }[] = [
  { value: 'stars', label: 'Melhores avaliações' },
  { value: 'distance', label: 'Mais próximos' },
];

export default function AprenderScreen() {
  useLightStatusBar();
  const { query, setQuery, sport, setSport, sort, setSort, results } =
    useTeacherSearch(MOCK_TEACHERS);
  const [view, setView] = useState<ViewMode>('list');
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);

  const selectedVenue = selectedVenueId ? getVenue(selectedVenueId) : undefined;
  // No mapa, tocar num pino mostra só os professores daquele local.
  const visibleTeachers =
    view === 'map' && selectedVenueId
      ? results.filter((teacher) => teacher.venueId === selectedVenueId)
      : results;

  return (
    <View style={styles.screen}>
      <ScreenScrollView withTabBar={false} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <SegmentedControl options={VIEW_OPTIONS} value={view} onChange={setView} />
        </View>

        <View style={styles.search}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            tintColor={Colors.textSecondary}
            size={20}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar professor, local ou bairro"
            placeholderTextColor={Colors.textSecondary}
            accessibilityLabel="Buscar professor, local ou bairro"
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>

        <SportChips
          value={sport}
          onChange={setSport}
          allLabel="Todos"
          style={[styles.section, styles.filters]}
        />

        <View style={[styles.section, styles.sortRow]}>
          <Text style={styles.sortLabel}>Ordenar por</Text>
          {SORT_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              variant="soft"
              selected={option.value === sort}
              onPress={() => setSort(option.value)}
            />
          ))}
        </View>

        {view === 'map' && (
          <View style={[styles.section, styles.mapBlock]}>
            <RegionMap
              pins={pinsByVenue(
                results,
                (venue, count) =>
                  `${venue.name}: ${count} ${count === 1 ? 'professor' : 'professores'}`
              )}
              selectedPinId={selectedVenueId}
              onSelectPin={setSelectedVenueId}
              showUserLocation
            />
          </View>
        )}

        <View style={[styles.section, styles.listHeader]}>
          <Text style={styles.count}>
            {view === 'map' && selectedVenue
              ? selectedVenue.name
              : `${results.length} ${results.length === 1 ? 'professor' : 'professores'}`}
          </Text>
          {view === 'map' && selectedVenue && (
            <Button
              label="Ver todos"
              size="small"
              variant="outline"
              onPress={() => setSelectedVenueId(null)}
            />
          )}
        </View>

        <View style={[styles.section, styles.list]}>
          {visibleTeachers.length > 0 ? (
            visibleTeachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nenhum professor encontrado</Text>
              <Text style={styles.emptyText}>Tente outra busca ou outro esporte.</Text>
            </View>
          )}
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
  section: {
    paddingHorizontal: Spacing.four,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
    marginHorizontal: Spacing.four,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    color: Colors.text,
    fontSize: 15,
  },
  filters: {
    marginTop: Spacing.three,
  },
  sortRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  sortLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: 600,
  },
  mapBlock: {
    marginTop: Spacing.four,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
  },
  count: {
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
  },
});
