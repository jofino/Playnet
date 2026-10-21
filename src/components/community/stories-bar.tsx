import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Colors, Spacing } from '@/constants/theme';
import type { StoryGroup } from '@/data/community';
import { ME } from '@/data/players';
import { useUser } from '@/state/user-context';

const AVATAR = 60;
const RING = 3;

type StoriesBarProps = {
  groups: StoryGroup[];
  /** Abre os stories a partir do grupo indicado. */
  onOpen: (groupIndex: number) => void;
  onCreate: () => void;
};

/** Faixa de stories: o seu primeiro (com "+"), depois os dos outros. Anel laranja = não visto. */
export function StoriesBar({ groups, onOpen, onCreate }: StoriesBarProps) {
  const { user } = useUser();
  const myIndex = groups.findIndex((group) => group.author === ME);
  const others = groups.map((group, index) => ({ group, index })).filter(({ group }) => group.author !== ME);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bar}>
      <View style={styles.item}>
        <Pressable
          onPress={() => (myIndex >= 0 ? onOpen(myIndex) : onCreate())}
          accessibilityRole="button"
          accessibilityLabel={myIndex >= 0 ? 'Ver seu story' : 'Criar story'}>
          <View style={[styles.ring, myIndex >= 0 ? styles.ringNew : styles.ringNone]}>
            <Avatar name={user.name} size={AVATAR} photoUri={user.photoUri} />
          </View>
        </Pressable>
        <Pressable onPress={onCreate} accessibilityRole="button" accessibilityLabel="Adicionar ao seu story" style={styles.add}>
          <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} tintColor={Colors.onPrimary} size={14} />
        </Pressable>
        <Text style={styles.name}>Seu story</Text>
      </View>

      {others.map(({ group, index }) => (
        <Pressable
          key={group.author}
          onPress={() => onOpen(index)}
          accessibilityRole="button"
          accessibilityLabel={`Story de ${group.author}${group.seen ? '' : ', não visto'}`}
          style={styles.item}>
          <View style={[styles.ring, group.seen ? styles.ringSeen : styles.ringNew]}>
            <Avatar name={group.author} size={AVATAR} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {group.author.split(' ')[0]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  item: {
    width: AVATAR + RING * 4,
    alignItems: 'center',
    gap: Spacing.one,
  },
  ring: {
    padding: RING,
    borderRadius: (AVATAR + RING * 4) / 2,
    borderWidth: RING,
  },
  ringNew: {
    borderColor: Colors.primary,
  },
  ringSeen: {
    borderColor: Colors.border,
  },
  ringNone: {
    borderColor: 'transparent',
  },
  add: {
    position: 'absolute',
    top: AVATAR - 10,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 600,
  },
});
