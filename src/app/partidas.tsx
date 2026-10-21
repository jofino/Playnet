import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { MatchCard } from '@/components/matches/match-card';
import { ScheduleMatchSheet } from '@/components/matches/schedule-match-sheet';
import { pinsByVenue, RegionMap } from '@/components/region-map';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SegmentedControl } from '@/components/segmented-control';
import { SportChips } from '@/components/sport-chips';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { byDate, isFinished, openSpots } from '@/data/matches';
import { getVenue, USER_REGION } from '@/data/venues';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useNow } from '@/hooks/use-now';
import { useMatchesStore } from '@/state/matches-context';

type ViewMode = 'list' | 'map';

/** Encontrar partida: próximas partidas da região, em lista ou no mapa. */
export default function PartidasScreen() {
  useLightStatusBar();
  const router = useRouter();
  const { matches, createMatch } = useMatchesStore();
  const [view, setView] = useState<ViewMode>('list');
  const [sport, setSport] = useState<Sport | null>(null);
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);

  const now = useNow();
  const upcoming = matches
    .filter((m) => !isFinished(m, now))
    .filter((m) => !sport || m.sport === sport)
    .filter((m) => !onlyOpen || openSpots(m) > 0)
    .sort(byDate);
  const visible =
    view === 'map' && selectedVenueId ? upcoming.filter((m) => m.venueId === selectedVenueId) : upcoming;
  const selectedVenue = selectedVenueId ? getVenue(selectedVenueId) : undefined;

  return (
    <View style={styles.screen}>
      <ScreenScrollView withTabBar={false}>
        <View style={styles.section}>
          <SegmentedControl
            options={[
              { value: 'list', label: 'Lista' },
              { value: 'map', label: 'Mapa' },
            ]}
            value={view}
            onChange={setView}
          />
        </View>

        <SportChips value={sport} onChange={setSport} allLabel="Todos" style={[styles.section, styles.filters]} />
        <View style={[styles.section, styles.row]}>
          <Chip label="Só com vagas" variant="soft" selected={onlyOpen} onPress={() => setOnlyOpen(!onlyOpen)} />
          <Button label="Marcar partida" size="small" onPress={() => setScheduling(true)} style={styles.create} />
        </View>

        {view === 'map' && (
          <View style={[styles.section, styles.map]}>
            <RegionMap
              pins={pinsByVenue(
                upcoming,
                (venue, count) => `${venue.name}: ${count} ${count === 1 ? 'partida' : 'partidas'}`
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
              : `${visible.length} ${visible.length === 1 ? 'partida' : 'partidas'} em ${USER_REGION}`}
          </Text>
          {view === 'map' && selectedVenue && (
            <Button label="Ver todas" size="small" variant="outline" onPress={() => setSelectedVenueId(null)} />
          )}
        </View>

        <View style={[styles.section, styles.list]}>
          {visible.length > 0 ? (
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
          onSchedule={(match) => {
            const id = createMatch(match);
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
  filters: {
    marginTop: Spacing.three,
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
  map: {
    marginTop: Spacing.four,
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
