import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { PostComposerSheet } from '@/components/community/post-composer-sheet';
import { PostFeed } from '@/components/community/post-feed';
import { ScreenHeader } from '@/components/screen-header';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { SegmentedControl } from '@/components/segmented-control';
import { ERROR_ICON, StateMessage } from '@/components/state-message';
import { TextField } from '@/components/text-field';
import { UserRow } from '@/components/user-row';
import { Colors, Spacing } from '@/constants/theme';
import { useAccountSearch } from '@/hooks/use-account-search';
import { isNearEnd, usePostList } from '@/hooks/use-post-list';
import { MIN_SEARCH_LENGTH } from '@/lib/perfis';
import { useUser } from '@/state/user-context';

type Feed = 'all' | 'following';

/** Comunidade: busca de contas e feed de publicações. */
export default function ComunidadeScreen() {
  const [feed, setFeed] = useState<Feed>('all');

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Comunidade" />
      {/* A chave recomeça a lista e a rolagem ao trocar de feed. */}
      <CommunityFeed key={feed} feed={feed} onChangeFeed={setFeed} />
    </View>
  );
}

function CommunityFeed({ feed, onChangeFeed }: { feed: Feed; onChangeFeed: (feed: Feed) => void }) {
  const { user } = useUser();
  const list = usePostList({ kind: feed });
  const search = useAccountSearch();
  const [composing, setComposing] = useState(false);

  return (
    <>
      <ScreenScrollView
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={200}
        onScroll={(event) => {
          if (!search.active && isNearEnd(event)) list.loadMore();
        }}
        refreshControl={
          <RefreshControl
            refreshing={list.refreshing}
            onRefresh={search.active ? search.retry : list.refresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>
        <View style={styles.section}>
          <TextField
            label="Buscar contas"
            value={search.term}
            onChangeText={search.setTerm}
            placeholder="Nome da pessoa"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            trailing={
              search.term ? (
                <Pressable
                  onPress={() => search.setTerm('')}
                  accessibilityRole="button"
                  accessibilityLabel="Limpar busca"
                  hitSlop={8}>
                  <SymbolView
                    name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                    tintColor={Colors.textSecondary}
                    size={20}
                  />
                </Pressable>
              ) : undefined
            }
          />
        </View>

        {search.active ? (
          <View style={styles.results}>
            {!search.searchable ? (
              <Text style={styles.hint}>Digite pelo menos {MIN_SEARCH_LENGTH} caracteres.</Text>
            ) : search.loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={styles.loading} />
            ) : search.error ? (
              <StateMessage icon={ERROR_ICON} text={search.error} onRetry={search.retry} />
            ) : search.users.length > 0 ? (
              <View style={styles.section}>
                {search.users.map((account) => (
                  <UserRow key={account.id} user={account} />
                ))}
              </View>
            ) : (
              <StateMessage
                icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                text="Nenhuma conta encontrada"
              />
            )}
          </View>
        ) : (
          <>
            <Pressable
              onPress={() => setComposing(true)}
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
                onChange={onChangeFeed}
              />
            </View>

            <View style={styles.feed}>
              {feed === 'all' ? (
                <PostFeed
                  list={list}
                  emptyIcon={{ ios: 'bubble.left.and.bubble.right', android: 'forum', web: 'forum' }}
                  emptyText="Ainda não há publicações. Seja a primeira pessoa a publicar!"
                />
              ) : (
                <PostFeed
                  list={list}
                  emptyIcon={{ ios: 'person.2', android: 'group', web: 'group' }}
                  emptyText="Siga pessoas para ver as publicações delas aqui"
                />
              )}
            </View>
          </>
        )}
      </ScreenScrollView>

      {composing && <PostComposerSheet onClose={() => setComposing(false)} onPublished={list.reload} />}
    </>
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
  results: {
    marginTop: Spacing.three,
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  loading: {
    marginTop: Spacing.four,
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
    marginTop: Spacing.three,
  },
});
