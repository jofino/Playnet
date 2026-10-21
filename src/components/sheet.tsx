import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useIsWideLayout } from '@/hooks/use-is-wide-layout';

type SheetProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Área fixa abaixo do conteúdo rolável (ex.: botões de confirmar). */
  footer?: ReactNode;
};

/**
 * Painel modal: sobe de baixo no celular e abre centralizado em telas largas.
 */
export function Sheet({ visible, title, onClose, children, footer }: SheetProps) {
  const isWide = useIsWideLayout();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, isWide ? styles.overlayCentered : styles.overlayBottom]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar" />
        <View
          style={[
            styles.sheet,
            isWide ? styles.sheetCentered : [styles.sheetBottom, { paddingBottom: insets.bottom }],
          ]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Fechar">
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                tintColor={Colors.textSecondary}
                size={22}
              />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  overlayBottom: {
    justifyContent: 'flex-end',
  },
  overlayCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  sheet: {
    backgroundColor: Colors.background,
    maxHeight: '85%',
  },
  sheetBottom: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetCentered: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: 700,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
