import { Platform } from 'react-native';

import { BottomTabInset, WebBottomTabBarHeight, WebTopTabBarHeight } from '@/constants/theme';
import { useIsWideLayout } from '@/hooks/use-is-wide-layout';

/** Espaço que a barra de abas ocupa sobre o conteúdo da tela, no topo e embaixo. */
export function useTabBarInsets() {
  const isWide = useIsWideLayout();

  if (Platform.OS !== 'web') {
    return { top: 0, bottom: BottomTabInset };
  }
  return isWide ? { top: WebTopTabBarHeight, bottom: 0 } : { top: 0, bottom: WebBottomTabBarHeight };
}
