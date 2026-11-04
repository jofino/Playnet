import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Colors, Spacing } from '@/constants/theme';
import type { Post } from '@/data/community';
import { useOpenUserProfile } from '@/hooks/use-open-profile';
import { useUser } from '@/state/user-context';
import { formatRelative } from '@/utils/time';

type PostCardProps = {
  post: Post;
  onToggleLike: () => void;
  /** Só aparece nas publicações do próprio usuário. */
  onDelete: () => void;
  /** `false` na própria tela da publicação (não abre de novo ao tocar). */
  linkToDetail?: boolean;
};

/** Publicação do feed: autor, texto, curtidas e comentários. */
export function PostCard({ post, onToggleLike, onDelete, linkToDetail = true }: PostCardProps) {
  const router = useRouter();
  const openProfile = useOpenUserProfile();
  const { user } = useUser();
  const isMine = post.authorId === user.id;
  const openDetail = () => router.push({ pathname: '/post/[id]', params: { id: post.id } });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={() => openProfile(post.authorId)}
          accessibilityRole="link"
          accessibilityLabel={`Ver perfil de ${post.author}`}
          style={styles.author}>
          <Avatar name={post.author} size={40} photoUri={isMine ? user.photoUri : null} />
          <View style={styles.headerTexts}>
            <Text style={styles.authorName} numberOfLines={1}>
              {post.author}
            </Text>
            <Text style={styles.time}>{formatRelative(post.createdAt)}</Text>
          </View>
        </Pressable>
        {isMine && (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Apagar publicação"
            hitSlop={8}>
            <SymbolView
              name={{ ios: 'trash', android: 'delete', web: 'delete' }}
              tintColor={Colors.textSecondary}
              size={20}
            />
          </Pressable>
        )}
      </View>

      <Pressable onPress={openDetail} disabled={!linkToDetail} accessibilityRole={linkToDetail ? 'button' : undefined}>
        <Text style={styles.text}>{post.text}</Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={onToggleLike}
          accessibilityRole="button"
          accessibilityState={{ selected: post.likedByMe }}
          accessibilityLabel={`${post.likedByMe ? 'Descurtir' : 'Curtir'}, ${post.likes} curtidas`}
          hitSlop={8}
          style={styles.action}>
          <SymbolView
            name={{ ios: post.likedByMe ? 'heart.fill' : 'heart', android: 'favorite', web: 'favorite' }}
            tintColor={post.likedByMe ? Colors.primary : Colors.textSecondary}
            size={22}
          />
          <Text style={[styles.actionText, post.likedByMe && styles.liked]}>{post.likes}</Text>
        </Pressable>
        <Pressable
          onPress={openDetail}
          disabled={!linkToDetail}
          accessibilityRole="button"
          accessibilityLabel={`${post.commentCount} comentários`}
          hitSlop={8}
          style={styles.action}>
          <SymbolView
            name={{ ios: 'bubble.right', android: 'chat_bubble', web: 'chat_bubble' }}
            tintColor={Colors.textSecondary}
            size={21}
          />
          <Text style={styles.actionText}>{post.commentCount}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three - Spacing.one,
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
  },
  author: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
  },
  headerTexts: {
    flex: 1,
  },
  authorName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 800,
  },
  time: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  text: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + Spacing.half,
  },
  actionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: 700,
  },
  liked: {
    color: Colors.primary,
  },
});
