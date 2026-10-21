import { useRouter, type Href } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Colors, Spacing } from '@/constants/theme';
import { UNREAD_NOTIFICATIONS } from '@/data/notifications';
import { useUser } from '@/state/user-context';

type MenuItem = {
  label: string;
  href: Href;
  icon: SymbolViewProps['name'];
  badge?: number;
};

const ITEMS: MenuItem[] = [
  {
    label: 'Notificações',
    href: '/notificacoes',
    icon: { ios: 'bell', android: 'notifications', web: 'notifications' },
    badge: UNREAD_NOTIFICATIONS,
  },
];

type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

/** Menu lateral aberto pelo botão de três barras do cabeçalho. */
export function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  function open(href: Href) {
    onClose();
    router.push(href);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar menu" />
        <Animated.View
          entering={SlideInRight.duration(220)}
          style={[styles.panel, { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom }]}
          accessibilityViewIsModal>
          <View style={styles.user}>
            <Avatar name={user.name} size={52} photoUri={user.photoUri} />
            <View style={styles.userTexts}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.userCoins}>
                {user.playnetCoins.toLocaleString('pt-BR')} Playnet Coins
              </Text>
            </View>
          </View>

          {ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => open(item.href)}
              accessibilityRole="button"
              accessibilityLabel={
                item.badge ? `${item.label}, ${item.badge} não lidas` : item.label
              }
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}>
              <SymbolView name={item.icon} tintColor={Colors.text} size={24} />
              <Text style={styles.itemLabel}>{item.label}</Text>
              {!!item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'flex-end',
  },
  panel: {
    width: '82%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: Colors.background,
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    marginBottom: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userTexts: {
    flex: 1,
  },
  userName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 700,
  },
  userCoins: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 600,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  itemPressed: {
    backgroundColor: Colors.backgroundElement,
  },
  itemLabel: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
    fontWeight: 600,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: Spacing.one + Spacing.half,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: Colors.onPrimary,
    fontSize: 12,
    fontWeight: 700,
  },
});
