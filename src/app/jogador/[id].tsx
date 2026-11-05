import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { PostFeed } from '@/components/community/post-feed';
import { MatchCard } from '@/components/matches/match-card';
import { ProfileBanner } from '@/components/profile/profile-banner';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SectionHeader } from '@/components/section-header';
import { ERROR_ICON, StateMessage } from '@/components/state-message';
import { Colors, Spacing } from '@/constants/theme';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { isNearEnd, usePostList } from '@/hooks/use-post-list';
import { useUserActivity } from '@/hooks/use-user-activity';
import { useUserCounts } from '@/hooks/use-user-counts';
import { getDataErrorMessage } from '@/lib/data-errors';
import { fetchProfile, followUser, isFollowing, unfollowUser, type Profile } from '@/lib/perfis';
import { useUser } from '@/state/user-context';

const AVATAR_SIZE = 84;
const AVATAR_OVERLAP = 42;

/** Perfil público de outra pessoa. */
export default function JogadorScreen() {
  useLightStatusBar();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const activity = useUserActivity(id);
  const { counts, setCounts, error: countsError, reload: reloadCounts } = useUserCounts(id);
  const posts = usePostList({ kind: 'author', authorId: id });
  const [player, setPlayer] = useState<Profile | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followError, setFollowError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [profile, followed] = await Promise.all([fetchProfile(id), isFollowing(user.id, id)]);
      setPlayer(profile);
      setFollowing(followed);
      setError(null);
    } catch (failure) {
      setError(getDataErrorMessage(failure));
    } finally {
      setLoading(false);
    }
  }, [id, user.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (id === user.id) return <Redirect href="/perfil" />;

  if (loading) {
    return (
      <View style={styles.missing}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (!player) {
    return (
      <View style={styles.missing}>
        {error ? (
          <StateMessage
            icon={ERROR_ICON}
            text={error}
            onRetry={() => {
              setLoading(true);
              load();
            }}
          />
        ) : (
          <Text style={styles.name}>Jogador não encontrado</Text>
        )}
      </View>
    );
  }

  async function refresh() {
    setRefreshing(true);
    await Promise.all([load(), reloadCounts(), activity.reload(), posts.refresh()]);
    setRefreshing(false);
  }

  /** Atualiza a tela na hora e desfaz se o banco recusar. */
  async function toggleFollow() {
    const next = !following;
    const delta = next ? 1 : -1;
    const changeFollowers = (change: number) =>
      setCounts((current) => current && { ...current, followers: current.followers + change });

    setFollowing(next);
    changeFollowers(delta);
    setFollowError(null);
    setSaving(true);
    try {
      await (next ? followUser(id) : unfollowUser(user.id, id));
      await reloadCounts();
    } catch (failure) {
      setFollowing(!next);
      changeFollowers(-delta);
      setFollowError(getDataErrorMessage(failure));
    } finally {
      setSaving(false);
    }
  }

  const message = followError ?? error ?? countsError ?? activity.error;

  return (
    <View style={styles.screen}>
      <ScreenScrollView
        withTabBar={false}
        scrollEventThrottle={200}
        onScroll={(event) => {
          if (isNearEnd(event)) posts.loadMore();
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>
        <View style={styles.section}>
          <ProfileBanner bannerId={null} style={styles.banner} />
        </View>
        <View style={[styles.section, styles.identity]}>
          <View style={styles.avatarRing}>
            <Avatar name={player.name} size={AVATAR_SIZE} />
          </View>
          <View style={styles.identityTexts}>
            <Text style={styles.name}>{player.name}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.stats]}>
          <Stat
            value={counts?.games ?? null}
            label="Jogos"
            onPress={() => router.push({ pathname: '/jogos/[id]', params: { id } })}
          />
          <Stat
            value={counts?.followers ?? null}
            label="Seguidores"
            onPress={() => router.push({ pathname: '/seguidores/[id]', params: { id } })}
          />
          <Stat
            value={counts?.friends ?? null}
            label="Amigos"
            onPress={() => router.push({ pathname: '/amigos/[id]', params: { id } })}
          />
        </View>

        <View style={[styles.section, styles.actions]}>
          <Button
            label={following ? 'Seguindo' : 'Seguir'}
            variant={following ? 'outline' : 'solid'}
            onPress={toggleFollow}
            disabled={saving}
            style={styles.actionButton}
          />
        </View>
        {!!message && (
          <Text style={[styles.section, styles.error]} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {message}
          </Text>
        )}

        {activity.upcoming.length > 0 && (
          <>
            <SectionHeader title="Próximas partidas" style={[styles.section, styles.sectionSpacing]} />
            <View style={[styles.section, styles.list]}>
              {activity.upcoming.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </View>
          </>
        )}

        {activity.played.length > 0 && (
          <>
            <SectionHeader title="Partidas jogadas" style={[styles.section, styles.sectionSpacing]} />
            <View style={[styles.section, styles.list]}>
              {activity.played.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </View>
          </>
        )}

        <SectionHeader title="Publicações" style={[styles.section, styles.sectionSpacing]} />
        <PostFeed
          list={posts}
          emptyIcon={{ ios: 'bubble.left.and.bubble.right', android: 'forum', web: 'forum' }}
          emptyText="Nenhuma publicação ainda."
        />
      </ScreenScrollView>
    </View>
  );
}

function Stat({ value, label, onPress }: { value: number | null; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value ?? 'carregando'}`}
      style={({ pressed }) => [styles.stat, pressed && styles.pressed]}>
      <Text style={styles.statValue}>{value ?? '–'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
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
    padding: Spacing.four,
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
  stats: {
    flexDirection: 'row',
    marginTop: Spacing.four,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
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
  error: {
    color: '#D92D20',
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  list: {
    gap: Spacing.three - Spacing.one,
  },
});
