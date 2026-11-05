import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SideMenu } from '@/components/side-menu';
import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { UNREAD_NOTIFICATIONS } from '@/data/notifications';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';
import { useTabBarInsets } from '@/hooks/use-tab-bar-insets';

// Proporção (largura / altura) de playnet-wordmark.png, recortado da arte oficial do logo.
const WORDMARK_ASPECT_RATIO = 1022 / 280;

/**
 * Barra laranja no topo das abas: símbolo à esquerda, "playnet" por extenso no centro
 * e o botão do menu lateral à direita.
 *
 * @param title Nome da tela, anunciado por leitores de tela (não aparece na barra).
 */
export function ScreenHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const tabBar = useTabBarInsets();
  const [menuOpen, setMenuOpen] = useState(false);

  useLightStatusBar();

  return (
    <View style={[styles.container, { paddingTop: insets.top + tabBar.top + Spacing.three }]}>
      <View style={styles.content} accessibilityRole="header" accessibilityLabel={`Playnet, ${title}`}>
        {/* Os dois lados têm a mesma largura para o "playnet" ficar no centro exato. */}
        <View style={styles.side}>
          <Image
            source={require('@/assets/images/brand/playnet-mark-white.png')}
            style={styles.mark}
            contentFit="contain"
          />
        </View>
        <Image
          source={require('@/assets/images/brand/playnet-wordmark.png')}
          style={styles.wordmark}
          contentFit="contain"
        />
        <View style={[styles.side, styles.right]}>
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
            style={({ pressed }) => pressed && styles.pressed}>
            <SymbolView
              name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }}
              tintColor={Colors.onPrimary}
              size={28}
            />
            {UNREAD_NOTIFICATIONS > 0 && <View style={styles.dot} />}
          </Pressable>
        </View>
      </View>

      <SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingBottom: Spacing.three,
  },
  // Alinhado ao conteúdo de ScreenScrollView em telas largas.
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    justifyContent: 'flex-end',
  },
  mark: {
    width: 36,
    height: 36,
  },
  wordmark: {
    height: 28,
    aspectRatio: WORDMARK_ASPECT_RATIO,
  },
  pressed: {
    opacity: 0.7,
  },
  dot: {
    position: 'absolute',
    top: 0,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.onPrimary,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});
