import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { Colors, Spacing } from '@/constants/theme';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Pede confirmação antes de uma ação (ex.: gastar Playnet Coins). */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Sheet
      visible={visible}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onCancel} style={styles.button} />
          <Button label={confirmLabel} onPress={onConfirm} style={styles.button} />
        </>
      }>
      <Text style={styles.message}>{message}</Text>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  message: {
    color: Colors.text,
    fontSize: 16,
    lineHeight: 22,
    padding: Spacing.four,
  },
  button: {
    flex: 1,
  },
});
