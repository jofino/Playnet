import { useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from '@/components/community/post-card';
import { PlayerChip } from '@/components/player-chip';
import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useCommunity } from '@/state/community-context';
import { formatRelative } from '@/utils/time';

/** Publicação com os comentários e o campo para comentar. */
export default function PostScreen() {
  useLightStatusBar();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, addComment } = useCommunity();
  const [comment, setComment] = useState('');

  const post = posts.find((item) => item.id === id);
  if (!post) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Publicação não encontrada</Text>
      </View>
    );
  }

  function send() {
    const text = comment.trim();
    if (!text || !post) return;
    addComment(post.id, text);
    setComment('');
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenScrollView withTabBar={false} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <PostCard post={post} linkToDetail={false} />
        </View>
        <Text style={[styles.section, styles.title]}>
          {post.comments.length} {post.comments.length === 1 ? 'comentário' : 'comentários'}
        </Text>
        <View style={[styles.section, styles.comments]}>
          {post.comments.map((item) => (
            <View key={item.id} style={styles.comment}>
              <View style={styles.commentHeader}>
                <PlayerChip name={item.author} size="small" />
                <Text style={styles.time}>{formatRelative(item.createdAt)}</Text>
              </View>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScreenScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.two }]}>
        <View style={styles.inputRow}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Escreva um comentário…"
            placeholderTextColor={Colors.textSecondary}
            accessibilityLabel="Comentário"
            onSubmitEditing={send}
            returnKeyType="send"
            style={styles.input}
          />
          <Pressable
            onPress={send}
            disabled={!comment.trim()}
            accessibilityRole="button"
            accessibilityLabel="Enviar comentário"
            style={[styles.send, !comment.trim() && styles.sendDisabled]}>
            <SymbolView name={{ ios: 'paperplane.fill', android: 'send', web: 'send' }} tintColor={Colors.onPrimary} size={18} />
          </Pressable>
        </View>
      </View>
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
  inputRow: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
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
});
