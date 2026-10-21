import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect, useEffectEvent, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Spacing } from '@/constants/theme';
import type { StoryGroup } from '@/data/community';
import { ME } from '@/data/players';
import { useUser } from '@/state/user-context';
import { formatRelative } from '@/utils/time';

/** Tempo de cada story na tela. */
const STORY_DURATION = 5000;

type StoryViewerProps = {
  groups: StoryGroup[];
  startGroup: number;
  onClose: () => void;
  onSeen: (author: string) => void;
};

/**
 * Stories em tela cheia: barras de progresso, avanço automático,
 * toque à esquerda volta e à direita avança.
 */
export function StoryViewer({ groups, startGroup, onClose, onSeen }: StoryViewerProps) {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [groupIndex, setGroupIndex] = useState(startGroup);
  const [itemIndex, setItemIndex] = useState(0);
  const [progress] = useState(() => new Animated.Value(0));

  const group = groups[groupIndex];
  const item = group?.items[itemIndex];

  function next() {
    if (!group) return;
    if (itemIndex < group.items.length - 1) {
      setItemIndex(itemIndex + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setItemIndex(0);
    } else {
      onClose();
    }
  }

  function previous() {
    if (itemIndex > 0) {
      setItemIndex(itemIndex - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      setItemIndex(groups[groupIndex - 1].items.length - 1);
    }
  }

  const markSeen = useEffectEvent(() => {
    if (group && !group.seen) onSeen(group.author);
  });
  const advance = useEffectEvent(() => next());

  // A cada story: marca o grupo como visto e anima a barra; ao terminar, avança.
  useEffect(() => {
    markSeen();
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) advance();
    });
    return () => animation.stop();
  }, [groupIndex, itemIndex, progress]);

  if (!group || !item) return null;
  const isMe = group.author === ME;

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.screen, { backgroundColor: item.background ?? '#000000' }]}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.textContent}>
            <Text style={styles.storyText}>{item.text}</Text>
          </View>
        )}

        {/* Toques: metade esquerda volta, metade direita avança. */}
        <View style={styles.tapZones}>
          <Pressable style={styles.tapZone} onPress={previous} accessibilityLabel="Story anterior" />
          <Pressable style={styles.tapZone} onPress={next} accessibilityLabel="Próximo story" />
        </View>

        <View style={[styles.top, { paddingTop: insets.top + Spacing.two }]} pointerEvents="box-none">
          <View style={styles.bars}>
            {group.items.map((story, index) => (
              <View key={story.id} style={styles.barTrack}>
                <Animated.View
                  style={[
                    styles.barFill,
                    {
                      width:
                        index < itemIndex
                          ? '100%'
                          : index === itemIndex
                            ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                            : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.header}>
            {/* Aro branco: o avatar laranja não some sobre fundos da mesma cor. */}
            <View style={styles.avatarRing}>
              <Avatar name={isMe ? user.name : group.author} size={34} photoUri={isMe ? user.photoUri : null} />
            </View>
            <Text style={styles.author}>{isMe ? 'Seu story' : group.author}</Text>
            <Text style={styles.time}>{formatRelative(item.createdAt)}</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fechar stories" hitSlop={12} style={styles.close}>
              <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor="#FFFFFF" size={26} />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  textContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  storyText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 800,
    textAlign: 'center',
    lineHeight: 38,
  },
  tapZones: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  top: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three - Spacing.one,
  },
  bars: {
    flexDirection: 'row',
    gap: Spacing.one,
  },
  barTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  avatarRing: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  author: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 800,
  },
  time: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
  },
  close: {
    marginLeft: 'auto',
  },
});
