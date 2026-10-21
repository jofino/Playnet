import { Platform, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTabBarInsets } from '@/hooks/use-tab-bar-insets';

/**
 * Área rolável das telas com abas: reserva o espaço da barra de abas
 * e centraliza o conteúdo com largura máxima em telas largas.
 */
export function ScreenScrollView({
  children,
  contentContainerStyle,
  withTabBar = true,
  ...props
}: ScrollViewProps & {
  /** `false` em telas que abrem por cima das abas e não têm a barra embaixo. */
  withTabBar?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const tabBar = useTabBarInsets();
  const bottomInset = insets.bottom + (withTabBar ? tabBar.bottom : 0) + Spacing.four;

  return (
    <ScrollView
      style={styles.scroll}
      contentInset={{ bottom: bottomInset }}
      scrollIndicatorInsets={{ bottom: bottomInset }}
      contentContainerStyle={[
        styles.content,
        // No iOS o espaço da barra de abas já vem do contentInset.
        Platform.OS !== 'ios' && { paddingBottom: bottomInset },
        contentContainerStyle,
      ]}
      {...props}>
      <View style={styles.container}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: Spacing.three,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});
