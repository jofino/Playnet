import type { SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PostCard } from '@/components/community/post-card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ERROR_ICON, StateMessage } from '@/components/state-message';
import { Colors, Spacing } from '@/constants/theme';
import type { PostList } from '@/hooks/use-post-list';

type PostFeedProps = {
  list: PostList;
  emptyIcon: SymbolViewProps['name'];
  emptyText: string;
};

/** Publicações de uma lista, com os estados de carregamento, vazio e erro. */
export function PostFeed({ list, emptyIcon, emptyText }: PostFeedProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (list.loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.loading} />;
  }
  if (list.posts.length === 0) {
    return list.error ? (
      <StateMessage icon={ERROR_ICON} text={list.error} onRetry={list.retry} />
    ) : (
      <StateMessage icon={emptyIcon} text={emptyText} />
    );
  }

  const message = list.actionError ?? list.error;

  return (
    <View style={styles.list}>
      {!!message && (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {message}
        </Text>
      )}

      {list.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onToggleLike={() => list.toggleLike(post)}
          onDelete={() => setDeletingId(post.id)}
        />
      ))}

      {list.loadingMore && <ActivityIndicator color={Colors.primary} />}
      {!!list.loadMoreError && (
        <StateMessage icon={ERROR_ICON} text={list.loadMoreError} onRetry={list.loadMore} />
      )}

      <ConfirmDialog
        visible={deletingId !== null}
        title="Apagar publicação"
        message="Essa publicação e os comentários dela serão apagados. Não é possível desfazer."
        confirmLabel="Apagar"
        onConfirm={() => {
          if (deletingId) list.removePost(deletingId);
          setDeletingId(null);
        }}
        onCancel={() => setDeletingId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: Spacing.four,
  },
  list: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
  },
});
