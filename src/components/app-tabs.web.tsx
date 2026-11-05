import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { SymbolView, type AndroidSymbol } from 'expo-symbols';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import {
  Colors,
  MaxContentWidth,
  Spacing,
  WebBottomTabBarHeight,
  WebTopTabBarHeight,
} from '@/constants/theme';
import { useIsWideLayout } from '@/hooks/use-is-wide-layout';

const TABS = [
  { name: 'loja', href: '/', label: 'Loja', icon: 'storefront' },
  { name: 'comunidade', href: '/comunidade', label: 'Comunidade', icon: 'groups' },
  { name: 'jogar', href: '/jogar', label: 'Jogar', icon: 'sports_tennis' },
  { name: 'ranking', href: '/ranking', label: 'Ranking', icon: 'leaderboard' },
  { name: 'perfil', href: '/perfil', label: 'Perfil', icon: 'person' },
] as const;

/**
 * Em telas largas (desktop) as abas ficam numa barra flutuante no topo;
 * em telas estreitas ficam numa barra fixa embaixo, como no app nativo.
 */
export default function AppTabs() {
  const isWide = useIsWideLayout();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        {isWide ? (
          <TopTabList>
            {TABS.map((tab) => (
              <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                <TopTabButton>{tab.label}</TopTabButton>
              </TabTrigger>
            ))}
          </TopTabList>
        ) : (
          <BottomTabList>
            {TABS.map((tab) => (
              <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
                <BottomTabButton icon={tab.icon}>{tab.label}</BottomTabButton>
              </TabTrigger>
            ))}
          </BottomTabList>
        )}
      </TabList>
    </Tabs>
  );
}

function TopTabButton({ children, isFocused, ...props }: Omit<TabTriggerSlotProps, 'ref'>) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type={isFocused ? 'primary' : 'backgroundElement'}
        style={styles.topTabButton}>
        <ThemedText
          type={isFocused ? 'smallBold' : 'small'}
          themeColor={isFocused ? 'onPrimary' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function TopTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.topTabList}>
      <ThemedView type="backgroundElement" style={styles.topTabListInner}>
        <ThemedText type="smallBold" themeColor="primary" style={styles.brandText}>
          Playnet
        </ThemedText>

        {props.children}
      </ThemedView>
    </View>
  );
}

function BottomTabButton({
  children,
  isFocused,
  icon,
  ...props
}: Omit<TabTriggerSlotProps, 'ref'> & { icon: AndroidSymbol }) {
  const color = isFocused ? Colors.primary : Colors.textSecondary;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.bottomTabButton, pressed && styles.pressed]}>
      <SymbolView name={{ web: icon }} tintColor={color} size={24} />
      <ThemedText type={isFocused ? 'smallBold' : 'small'} style={[styles.bottomTabLabel, { color }]}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

function BottomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.bottomTabList}>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },

  topTabList: {
    position: 'absolute',
    width: '100%',
    height: WebTopTabBarHeight,
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  topTabListInner: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderRadius: Spacing.five,
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
  },
  brandText: {
    marginRight: 'auto',
  },
  topTabButton: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },

  bottomTabList: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: WebBottomTabBarHeight,
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  bottomTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.half,
  },
  bottomTabLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
});
