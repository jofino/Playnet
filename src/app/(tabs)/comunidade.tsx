import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { PostCard } from '@/components/community/post-card';
import { PostComposerSheet } from '@/components/community/post-composer-sheet';
import { StoriesBar } from '@/components/community/stories-bar';
import { StoryComposerSheet } from '@/components/community/story-composer-sheet';
import { StoryViewer } from '@/components/community/story-viewer';
import { ScreenHeader } from '@/components/screen-header';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SegmentedControl } from '@/components/segmented-control';
import { Colors, Spacing } from '@/constants/theme';
import { ME, playerIdFromName } from '@/data/players';
import { useCommunity } from '@/state/community-context';
import { useUser } from '@/state/user-context';

type Feed = 'all' | 'following';
type OpenSheet = 'post' | 'story' | null;

/** Comunidade: stories e feed de publicações dos jogadores. */
export default function ComunidadeScreen() {
  const { user } = useUser();
  const { posts, stories, addPost, addStory, markSeen } = useCommunity();
  const [feed, setFeed] = useState<Feed>('all');
  const [sheet, setSheet] = useState<OpenSheet>(null);
  const [viewingGroup, setViewingGroup] = useState<number | null>(null);

  const visiblePosts =
    feed === 'all'
      ? posts
      : posts.filter((post) => post.author === ME || user.followingIds.includes(playerIdFromName(post.author)));

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Comunidade" />

      <ScreenScrollView>
        <StoriesBar groups={stories} onOpen={setViewingGroup} onCreate={() => setSheet('story')} />

        <Pressable
          onPress={() => setSheet('post')}
          accessibilityRole="button"
          accessibilityLabel="Criar publicação"
          style={({ pressed }) => [styles.section, styles.composer, pressed && styles.pressed]}>
          <Avatar name={user.name} size={40} photoUri={user.photoUri} />
          <View style={styles.composerInput}>
            <Text style={styles.composerText}>O que está rolando na quadra?</Text>
          </View>
        </Pressable>

        <View style={[styles.section, styles.feedToggle]}>
          <SegmentedControl
            options={[
              { value: 'all', label: 'Para você' },
              { value: 'following', label: 'Seguindo' },
            ]}
            value={feed}
            onChange={setFeed}
          />
        </View>

        <View style={[styles.section, styles.feed]}>
          {visiblePosts.length > 0 ? (
            visiblePosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nada por aqui ainda</Text>
              <Text style={styles.emptyText}>
                Siga jogadores pelo Ranking ou pelos perfis para ver as publicações deles.
              </Text>
            </View>
          )}
        </View>
      </ScreenScrollView>

      {sheet === 'post' && <PostComposerSheet onClose={() => setSheet(null)} onPublish={addPost} />}
      {sheet === 'story' && <StoryComposerSheet onClose={() => setSheet(null)} onPublish={addStory} />}
      {viewingGroup !== null && (
        <StoryViewer
          groups={stories}
          startGroup={viewingGroup}
          onClose={() => setViewingGroup(null)}
          onSeen={markSeen}
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
  pressed: {
    opacity: 0.8,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.four,
  },
  composerInput: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
    borderRadius: 999,
    backgroundColor: Colors.backgroundElement,
  },
  composerText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  feedToggle: {
    marginTop: Spacing.four,
  },
  feed: {
    gap: Spacing.three - Spacing.one,
    marginTop: Spacing.three,
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
