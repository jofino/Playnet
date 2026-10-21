import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { SportIcon } from '@/components/sport-icon';
import { Colors, Spacing } from '@/constants/theme';
import type { Post } from '@/data/community';
import { ME } from '@/data/players';
import { hasProfile, useOpenProfile } from '@/hooks/use-open-profile';
import { useCommunity } from '@/state/community-context';
import { useUser } from '@/state/user-context';
import { formatRelative } from '@/utils/time';

type PostCardProps = {
  post: Post;
  /** `false` na própria tela da publicação (não abre de novo ao tocar). */
  linkToDetail?: boolean;
};

/** Publicação do feed: autor, texto, foto, esporte, curtidas e comentários. */
export function PostCard({ post, linkToDetail = true }: PostCardProps) {
  const router = useRouter();
  const openProfile = useOpenProfile();
  const { user } = useUser();
  const { toggleLike } = useCommunity();
  const isMe = post.author === ME;
  const openDetail = () => router.push({ pathname: '/post/[id]', params: { id: post.id } });

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => openProfile(post.author)}
        disabled={!hasProfile(post.author)}
        accessibilityRole="link"
        accessibilityLabel={`Ver perfil de ${isMe ? 'você' : post.author}`}
        style={styles.header}>
        <Avatar name={isMe ? user.name : post.author} size={40} photoUri={isMe ? user.photoUri : null} />
        <View style={styles.headerTexts}>
          <Text style={styles.author}>{isMe ? user.name : post.author}</Text>
          <Text style={styles.time}>{formatRelative(post.createdAt)}</Text>
        </View>
        {post.sport && (
          <View style={styles.sport}>
            <SportIcon sport={post.sport} size={14} />
            <Text style={styles.sportText}>{post.sport}</Text>
          </View>
        )}
      </Pressable>

      <Pressable onPress={openDetail} disabled={!linkToDetail} accessibilityRole={linkToDetail ? 'button' : undefined}>
        <Text style={styles.text}>{post.text}</Text>
        {post.imageUri && (
          <Image source={{ uri: post.imageUri }} style={styles.image} contentFit="cover" accessibilityLabel="Foto da publicação" />
        )}
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          onPress={() => toggleLike(post.id)}
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
          accessibilityLabel={`${post.comments.length} comentários`}
          hitSlop={8}
          style={styles.action}>
          <SymbolView
            name={{ ios: 'bubble.right', android: 'chat_bubble', web: 'chat_bubble' }}
            tintColor={Colors.textSecondary}
            size={21}
          />
          <Text style={styles.actionText}>{post.comments.length}</Text>
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
  headerTexts: {
    flex: 1,
  },
  author: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 800,
  },
  time: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  sport: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: 999,
    backgroundColor: Colors.backgroundElement,
  },
  sportText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: 700,
  },
  text: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    marginTop: Spacing.two,
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
