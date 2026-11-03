import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { EditProfileSheet } from '@/components/profile/edit-profile-sheet';
import { PreferenceCard } from '@/components/profile/preference-card';
import { PreferencesSheet } from '@/components/profile/preferences-sheet';
import { ProfileBanner } from '@/components/profile/profile-banner';
import { RatingChart } from '@/components/profile/rating-chart';
import { RatingHistoryChart } from '@/components/profile/rating-history-chart';
import { RatingSheet } from '@/components/profile/rating-sheet';
import { SignOutButton } from '@/components/profile/sign-out-button';
import { ScreenHeader } from '@/components/screen-header';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SportChips } from '@/components/sport-chips';
import { SportIcon } from '@/components/sport-icon';
import { SPORT_PREFERENCES } from '@/constants/sport-preferences';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { useCosmeticsStore } from '@/hooks/use-cosmetics-store';
import { useIsWideLayout } from '@/hooks/use-is-wide-layout';
import { useProfilePhotoPicker } from '@/hooks/use-profile-photo-picker';
import { useSportProfile } from '@/hooks/use-sport-profile';
import { useUser } from '@/state/user-context';

const AVATAR_SIZE = 84;
const AVATAR_RING = 4;
/** Quanto o avatar sobe sobre o banner. */
const AVATAR_OVERLAP = 42;

const MATCH_FILTERS = ['Últimas 5 partidas', 'Últimas 10 partidas', 'Todas as partidas'] as const;
type MatchFilter = (typeof MATCH_FILTERS)[number];
const MATCH_WINDOW: Record<MatchFilter, number | null> = {
  'Últimas 5 partidas': 5,
  'Últimas 10 partidas': 10,
  'Todas as partidas': null,
};

type OpenSheet = 'profile' | 'rating' | 'preferences' | null;

export default function PerfilScreen() {
  const isWide = useIsWideLayout();
  const { user } = useUser();
  const { pickPhoto, uploading } = useProfilePhotoPicker();
  const { currentTitle } = useCosmeticsStore();
  const [sport, setSport] = useState<Sport>('Tênis');
  const { rating, history, preferences, setInitialRating, savePreferences } = useSportProfile(sport);
  const [matchFilter, setMatchFilter] = useState<MatchFilter>('Últimas 5 partidas');

  // Janela do gráfico: as últimas N partidas, partindo do rating anterior à primeira delas.
  const windowSize = MATCH_WINDOW[matchFilter];
  const chartEntries = windowSize === null ? history : history.slice(-(windowSize + 1));
  const matchesInWindow = chartEntries.filter((entry) => entry.matchId).length;
  const delta = chartEntries.length > 1 ? chartEntries[chartEntries.length - 1].rating - chartEntries[0].rating : 0;
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);

  const closeSheet = () => setOpenSheet(null);

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Perfil" />

      <ScreenScrollView>
        <View style={styles.section}>
          <ProfileBanner bannerId={user.currentBanner} style={styles.banner} />
        </View>
        <View style={[styles.section, styles.identity]}>
          {/* O avatar sobe sobre a borda de baixo do banner. */}
          <View style={styles.avatarRing}>
            <Avatar
              name={user.name}
              size={AVATAR_SIZE}
              photoUri={user.photoUri}
              onEditPhoto={pickPhoto}
              uploading={uploading}
            />
          </View>
          <View style={styles.identityTexts}>
            <Text style={styles.name}>{user.name}</Text>
            {currentTitle && (
              <View style={styles.title}>
                <Text style={styles.titleText}>
                  {currentTitle.emoji} {currentTitle.name}
                </Text>
              </View>
            )}
            <Pressable onPress={() => setOpenSheet('profile')} accessibilityRole="button">
              {user.location ? (
                <Text style={styles.location}>📍 {user.location}</Text>
              ) : (
                <Text style={styles.link}>Adicionar minha localização</Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={[styles.section, styles.stats]}>
          <Stat value={user.games} label="Jogos" />
          <View style={styles.statDivider} />
          <Stat value={user.followers} label="Seguidores" />
          <View style={styles.statDivider} />
          <Stat value={user.followingIds.length} label="Seguidos" />
        </View>

        <View style={[styles.section, styles.actions]}>
          <Button
            label="Editar perfil"
            variant="outline"
            onPress={() => setOpenSheet('profile')}
            style={styles.actionButton}
          />
        </View>

        {/* O esporte escolhido aqui define o rating e as preferências exibidos abaixo. */}
        <SportChips value={sport} onChange={setSport} style={[styles.section, styles.sports]} />

        <Text style={[styles.section, styles.sectionTitle, styles.sectionSpacing]}>
          Evolução do rating
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={[styles.section, styles.chipRow]}>
          {MATCH_FILTERS.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              variant="soft"
              selected={filter === matchFilter}
              onPress={() => setMatchFilter(filter)}
            />
          ))}
        </ScrollView>

        <View style={[styles.section, styles.card]}>
          {rating === null ? (
            <>
              <RatingChart />
              <Text style={styles.cardTitle}>Defina seu rating inicial</Text>
              <Text style={styles.cardText}>
                Faça o nivelamento para acompanhar a evolução do seu rating no {sport}.
              </Text>
              <Button
                label="Iniciar nivelamento"
                onPress={() => setOpenSheet('rating')}
                style={styles.cardButton}
              />
            </>
          ) : (
            <>
              <View style={styles.ratingHeader}>
                <SportIcon sport={sport} size={22} />
                <Text style={styles.ratingSport}>Seu rating no {sport}</Text>
              </View>
              <Text style={styles.ratingValue}>{rating.toLocaleString('pt-BR')}</Text>
              {matchesInWindow > 0 ? (
                <>
                  <Text style={[styles.ratingDelta, delta < 0 && styles.ratingDeltaDown]}>
                    {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} em {matchesInWindow}{' '}
                    {matchesInWindow === 1 ? 'partida' : 'partidas'}
                  </Text>
                  <RatingHistoryChart entries={chartEntries} />
                </>
              ) : (
                <Text style={styles.cardText}>
                  Registre o placar das suas partidas de {sport} para acompanhar a evolução do seu rating.
                </Text>
              )}
            </>
          )}
        </View>

        <View style={[styles.section, styles.sectionHeader, styles.sectionSpacing]}>
          <Text style={styles.sectionTitle}>Preferências de jogador</Text>
          <Pressable
            onPress={() => setOpenSheet('preferences')}
            accessibilityRole="button"
            accessibilityLabel={`Editar preferências de ${sport}`}>
            <Text style={styles.sectionAction}>Editar</Text>
          </Pressable>
        </View>
        <View style={[styles.section, styles.sportLabel]}>
          <SportIcon sport={sport} size={16} />
          <Text style={styles.sectionSubtitle}>{sport}</Text>
        </View>
        <View style={[styles.section, styles.preferences, isWide && styles.preferencesGrid]}>
          {SPORT_PREFERENCES[sport].map((preference) => (
            <View key={preference.key} style={isWide && styles.preferenceGridItem}>
              <PreferenceCard
                emoji={preference.emoji}
                label={preference.label}
                value={preferences[preference.key]}
                onPress={() => setOpenSheet('preferences')}
              />
            </View>
          ))}
        </View>

        <View style={[styles.section, styles.sectionSpacing]}>
          <SignOutButton />
        </View>
      </ScreenScrollView>

      {/* Cada painel é montado só quando aberto, para começar com os dados atuais. */}
      {openSheet === 'profile' && <EditProfileSheet onClose={closeSheet} />}
      {openSheet === 'rating' && (
        <RatingSheet sport={sport} onClose={closeSheet} onConfirm={setInitialRating} />
      )}
      {openSheet === 'preferences' && (
        <PreferencesSheet
          sport={sport}
          initial={preferences}
          onClose={closeSheet}
          onSave={savePreferences}
        />
      )}
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  },
  pressed: {
    opacity: 0.7,
  },

  banner: {
    height: 120,
    borderRadius: 16,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    marginTop: -AVATAR_OVERLAP,
    paddingLeft: Spacing.four + Spacing.three,
  },
  avatarRing: {
    borderRadius: AVATAR_SIZE / 2 + AVATAR_RING,
    borderWidth: AVATAR_RING,
    borderColor: Colors.background,
    backgroundColor: Colors.background,
  },
  // Os textos começam abaixo do banner para não ficarem sobre a arte.
  identityTexts: {
    flex: 1,
    gap: Spacing.one,
    paddingTop: AVATAR_OVERLAP + Spacing.two,
  },
  name: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 800,
  },
  title: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    backgroundColor: Colors.primarySoft,
  },
  titleText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: 800,
  },
  location: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: 600,
  },
  link: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: 600,
  },

  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  statValue: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 800,
  },
  statLabel: {
    color: Colors.text,
    fontSize: 15,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.four,
  },
  actionButton: {
    flex: 1,
  },

  chipRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  sports: {
    marginTop: Spacing.four,
  },
  filtersScroll: {
    flexGrow: 0,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: 800,
  },
  sportLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
    marginTop: Spacing.one,
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: 600,
  },
  sectionAction: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 700,
  },

  card: {
    marginTop: Spacing.five,
    marginHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: 700,
    marginTop: Spacing.three,
  },
  cardText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  cardButton: {
    marginTop: Spacing.three,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  ratingSport: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 700,
  },
  ratingValue: {
    color: Colors.primary,
    fontSize: 48,
    fontWeight: 800,
    marginTop: Spacing.two,
  },
  ratingDelta: {
    color: '#1A7F37',
    fontSize: 14,
    fontWeight: 800,
    marginBottom: Spacing.two,
  },
  ratingDeltaDown: {
    color: '#D92D20',
  },

  preferences: {
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceGridItem: {
    flexBasis: '40%',
    flexGrow: 1,
  },
});
