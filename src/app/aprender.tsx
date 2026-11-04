import { StyleSheet, Text } from 'react-native';

import { ScreenScrollView } from '@/components/screen-scroll-view';
import { Colors, Spacing } from '@/constants/theme';
import { useLightStatusBar } from '@/hooks/use-light-status-bar';

/** Aprender: as aulas ainda não têm tabela no banco. */
export default function AprenderScreen() {
  useLightStatusBar();

  return (
    <ScreenScrollView withTabBar={false}>
      <Text style={styles.empty}>Nenhuma aula disponível por enquanto</Text>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
});
