import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from '@/components/community/post-card';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { PlayerChip } from '@/components/player-chip';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { ERROR_ICON, StateMessage } from '@/components/state-message';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { COMMENT_MAX_LENGTH, withLikeToggled, type Comment, type Post } from '@/data/community';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import {
  createComment,
  deleteComment,
  deletePost,
  fetchComments,
  fetchPost,
  setPostLiked,
} from '@/lib/comunidade';
import { getDataErrorMessage } from '@/lib/data-errors';
import { useUser } from '@/state/user-context';
import { formatRelative } from '@/utils/time';

/** Publicação com os comentários e o campo para comentar. */
export default function PostScreen() {
  useLightStatusBar();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const likePending = useRef(false);

  const load = useCallback(async () => {
    try {
      const [nextPost, nextComments] = await Promise.all([fetchPost(id), fetchComments(id)]);
      setPost(nextPost);
      setComments(nextComments);
      setLoadError(null);
    } catch (failure) {
      setLoadError(getDataErrorMessage(failure));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function retry() {
    setLoading(true);
    load();
  }

  if (loading) {
    return (
      <View style={styles.missing}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (!post) {
    return (
      <View style={styles.missing}>
        {loadError ? (
          <StateMessage icon={ERROR_ICON} text={loadError} onRetry={retry} />
        ) : (
          <Text style={styles.missingText}>Publicação não encontrada</Text>
        )}
      </View>
    );
  }

  /** Curte ou descurte na hora e desfaz se o banco recusar. */
  async function toggleLike(current: Post) {
    if (likePending.current) return;
    likePending.current = true;
    setActionError(null);
    setPost(withLikeToggled(current));
    try {
      await setPostLiked(current.id, user.id, !current.likedByMe);
    } catch (failure) {
      setPost(current);
      setActionError(getDataErrorMessage(failure));
    } finally {
      likePending.current = false;
    }
  }

  async function removePost(current: Post) {
    setDeletingPost(false);
    setActionError(null);
    try {
      await deletePost(current.id);
      router.back();
    } catch (failure) {
      setActionError(getDataErrorMessage(failure));
    }
  }

  async function send() {
    const text = comment.trim();
    if (!text || sending) return;

    setSending(true);
    setActionError(null);
    try {
      await createComment(id, text);
      setComment('');
      await load();
    } catch (failure) {
      setActionError(getDataErrorMessage(failure));
    } finally {
      setSending(false);
    }
  }

  async function removeComment(commentId: string) {
    setDeletingCommentId(null);
    setActionError(null);
    try {
      await deleteComment(commentId);
      await load();
    } catch (failure) {
      setActionError(getDataErrorMessage(failure));
    }
  }

  const canSend = comment.trim() !== '' && !sending;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenScrollView
        withTabBar={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>
        <View style={styles.section}>
          <PostCard
            post={post}
            linkToDetail={false}
            onToggleLike={() => toggleLike(post)}
            onDelete={() => setDeletingPost(true)}
          />
        </View>
        {!!(actionError ?? loadError) && (
          <Text style={[styles.section, styles.error]} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {actionError ?? loadError}
          </Text>
        )}
        <Text style={[styles.section, styles.title]}>
          {comments.length} {comments.length === 1 ? 'comentário' : 'comentários'}
        </Text>
        {comments.length > 0 ? (
          <View style={[styles.section, styles.comments]}>
            {comments.map((item) => (
              <View key={item.id} style={styles.comment}>
                <View style={styles.commentHeader}>
                  <PlayerChip name={item.author} userId={item.authorId} size="small" />
                  <Text style={styles.time}>{formatRelative(item.createdAt)}</Text>
                  {item.authorId === user.id && (
                    <Pressable
                      onPress={() => setDeletingCommentId(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel="Apagar comentário"
                      hitSlop={8}>
                      <SymbolView
                        name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                        tintColor={Colors.textSecondary}
                        size={18}
                      />
                    </Pressable>
                  )}
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            ))}
          </View>
        ) : (
          <StateMessage
            icon={{ ios: 'bubble.right', android: 'chat_bubble', web: 'chat_bubble' }}
            text="Ainda não há comentários. Comece a conversa!"
          />
        )}
      </ScreenScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.two }]}>
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              editable={!sending}
              maxLength={COMMENT_MAX_LENGTH}
              placeholder="Escreva um comentário…"
              placeholderTextColor={Colors.textSecondary}
              accessibilityLabel="Comentário"
              onSubmitEditing={send}
              returnKeyType="send"
              style={styles.input}
            />
            <Pressable
              onPress={send}
              disabled={!canSend}
              accessibilityRole="button"
              accessibilityLabel="Enviar comentário"
              style={[styles.send, !canSend && styles.sendDisabled]}>
              {sending ? (
                <ActivityIndicator size="small" color={Colors.onPrimary} />
              ) : (
                <SymbolView name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }} tintColor={Colors.onPrimary} size={18} />
              )}
            </Pressable>
          </View>
          {comment.length > 0 && (
            <Text style={styles.counter}>
              {comment.length}/{COMMENT_MAX_LENGTH}
            </Text>
          )}
        </View>
      </View>

      <ConfirmDialog
        visible={deletingPost}
        title="Apagar publicação"
        message="Essa publicação e os comentários dela serão apagados. Não é possível desfazer."
        confirmLabel="Apagar"
        onConfirm={() => removePost(post)}
        onCancel={() => setDeletingPost(false)}
      />
      <ConfirmDialog
        visible={deletingCommentId !== null}
        title="Apagar comentário"
        message="Esse comentário será apagado. Não é possível desfazer."
        confirmLabel="Apagar"
        onConfirm={() => {
          if (deletingCommentId) removeComment(deletingCommentId);
        }}
        onCancel={() => setDeletingCommentId(null)}
      />
    </KeyboardAvoidingView>
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
  missingText: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: 700,
  },
  section: {
    paddingHorizontal: Spacing.four,
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
    marginTop: Spacing.two,
  },
  title: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 800,
    marginTop: Spacing.four,
  },
  comments: {
    gap: Spacing.three,
    marginTop: Spacing.three,
  },
  comment: {
    gap: Spacing.one + Spacing.half,
    padding: Spacing.three,
    borderRadius: 14,
    backgroundColor: Colors.backgroundElement,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  time: {
    marginLeft: 'auto',
    color: Colors.textSecondary,
    fontSize: 12,
  },
  commentText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  inputBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  inputArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.half,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    minWidth: 0,
    height: 44,
    paddingHorizontal: Spacing.three,
    borderRadius: 22,
    backgroundColor: Colors.backgroundElement,
    color: Colors.text,
    fontSize: 15,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
  counter: {
    alignSelf: 'flex-end',
    color: Colors.textSecondary,
    fontSize: 12,
  },
});
