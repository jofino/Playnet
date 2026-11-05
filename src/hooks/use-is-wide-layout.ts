import { useSyncExternalStore } from 'react';
import { Dimensions } from 'react-native';

import { WideLayoutMinWidth } from '@/constants/theme';

function subscribe(onChange: () => void) {
  const subscription = Dimensions.addEventListener('change', onChange);
  return () => subscription.remove();
}

function getSnapshot() {
  return Dimensions.get('window').width >= WideLayoutMinWidth;
}

/**
 * Indica se a janela é larga o bastante para o layout de desktop.
 * Na renderização estática da web começa como `false`, evitando divergência na hidratação.
 */
export function useIsWideLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
