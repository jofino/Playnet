import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { PostCard } from '@/components/community/post-card';
import { MatchCard } from '@/components/matches/match-card';
import { ScheduleMatchSheet } from '@/components/matches/schedule-match-sheet';
import { ProfileBanner } from '@/components/profile/profile-banner';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SectionHeader } from '@/components/section-header';
import { SportIcon } from '@/components/sport-icon';
import { SUPPORTED_SPORTS, type Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { byDate, isFinished } from '@/data/matches';
import { getPlayer } from '@/data/players';
import { RANKED_PLAYERS } from '@/data/ranking';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useCommunity } from '@/state/community-context';
import { useMatchesStore } from '@/state/matches-context';
import { useUser } from '@/state/user-context';

const AVATAR_SIZE = 84;
const AVATAR_OVERLAP = 42;

/** Posição do jogador no ranking nacional do esporte. */
function rankingPosition(name: string, sport: Sport) {
  const ordered = RANKED_PLAYERS.filter((row) => row.sport === sport).sort((a, b) => b.rating - a.rating);
  return ordered.findIndex((row) => row.name === name) + 1;
}

/** Perfil público de outro jogador. */
export default function JogadorScreen() {
  useLightStatusBar();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, updateUser } = useUser();
  const { matches, createMatch } = useMatchesStore();
  const { posts } = useCommunity();
  const [inviting, setInviting] = useState(false);

  const player = getPlayer(id);
  if (!player) {
    return (
      <View style={styles.missing}>
        <Text style={styles.name}>Jogador não encontrado</Text>
      </View>
    );
  }

  const following = user.followingIds.includes(player.id);
  const sports = SUPPORTED_SPORTS.filter((sport) => player.ratings[sport] !== undefined);
  const playerMatches = matches.filter((m) => m.sides.some((side) => side.includes(player.name)));
  const upcoming = playerMatches.filter((m) => !isFinished(m)).sort(byDate);
  const played = playerMatches.filter((m) => isFinished(m)).sort((a, b) => byDate(b, a));
  const playerPosts = posts.filter((post) => post.author === player.name);

  function toggleFollow() {
    updateUser({
      followingIds: following
        ? user.followingIds.filter((item) => item !== player?.id)
        : [...user.followingIds, player!.id],
    });
  }

  return (
    <View style={styles.screen}>
      <ScreenScrollView withTabBar={false}>
        <View style={styles.section}>
          <ProfileBanner bannerId={player.bannerId} style={styles.banner} />
        </View>
        <View style={[styles.section, styles.identity]}>
          <View style={styles.avatarRing}>
            <Avatar name={player.name} size={AVATAR_SIZE} />
          </View>
          <View style={styles.identityTexts}>
            <Text style={styles.name}>{player.name}</Text>
            <Text style={styles.location}>📍 {player.location}</Text>
          </View>
        </View>
        <Text style={[styles.section, styles.bio]}>{player.bio}</Text>

        <View style={[styles.section, styles.stats]}>
          <Stat value={played.length} label="Jogos" />
          <Stat value={player.followers + (following ? 1 : 0)} label="Seguidores" />
          <Stat value={player.following} label="Seguidos" />
        </View>

        <View style={[styles.section, styles.actions]}>
          <Button
            label={following ? 'Seguindo' : 'Seguir'}
            variant={following ? 'outline' : 'solid'}
            onPress={toggleFollow}
            style={styles.actionButton}
          />
          <Button label="Convidar" variant="outline" onPress={() => setInviting(true)} style={styles.actionButton} />
        </View>

        <SectionHeader title="Rating" style={[styles.section, styles.sectionSpacing]} />
        <View style={[styles.section, styles.ratings]}>
          {sports.map((sport) => (
            <View key={sport} style={styles.rating}>
              <SportIcon sport={sport} size={24} />
              <View style={styles.ratingTexts}>
                <Text style={styles.ratingSport}>{sport}</Text>
                <Text style={styles.ratingPosition}>{rankingPosition(player.name, sport)}º no ranking</Text>
              </View>
              <Text style={styles.ratingValue}>{player.ratings[sport]?.toLocaleString('pt-BR')}</Text>
            </View>
          ))}
        </View>

        {upcoming.length > 0 && (
          <>
            <SectionHeader title="Próximas partidas" style={[styles.section, styles.sectionSpacing]} />
            <View style={[styles.section, styles.list]}>
              {upcoming.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </View>
          </>
        )}

        {played.length > 0 && (
          <>
            <SectionHeader title="Partidas jogadas" style={[styles.section, styles.sectionSpacing]} />
            <View style={[styles.section, styles.list]}>
              {played.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </View>
          </>
        )}

        {playerPosts.length > 0 && (
          <>
            <SectionHeader title="Publicações" style={[styles.section, styles.sectionSpacing]} />
            <View style={[styles.section, styles.list]}>
              {playerPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </View>
          </>
        )}
      </ScreenScrollView>

      {inviting && (
        <ScheduleMatchSheet
          invitee={player.name}
          initialSport={sports[0]}
          onClose={() => setInviting(false)}
          onSchedule={(match) => {
            const matchId = createMatch(match);
            router.push({ pathname: '/partida/[id]', params: { id: matchId } });
          }}
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
    borderRadius: AVATAR_SIZE / 2 + 4,
    borderWidth: 4,
    borderColor: Colors.background,
    backgroundColor: Colors.background,
  },
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
  location: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: 600,
  },
  bio: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginTop: Spacing.three,
  },
  stats: {
    flexDirection: 'row',
    marginTop: Spacing.four,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  statValue: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: 800,
  },
  statLabel: {
    color: Colors.text,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.four,
  },
  actionButton: {
    flex: 1,
  },
  ratings: {
    gap: Spacing.two,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ratingTexts: {
    flex: 1,
  },
  ratingSport: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 700,
  },
  ratingPosition: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  ratingValue: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: 800,
  },
  list: {
    gap: Spacing.three - Spacing.one,
  },
});
