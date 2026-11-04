import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Sheet } from '@/components/sheet';
import { TextField } from '@/components/text-field';
import { Colors, Spacing } from '@/constants/theme';
import { getDataErrorMessage } from '@/lib/data-errors';
import { updateDisplayName } from '@/lib/perfis';
import { useUser } from '@/state/user-context';

/** Edição do que existe na tabela de perfis: por enquanto, só o nome. */
export function EditProfileSheet({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const nameError = name.trim() === '' ? 'Informe seu nome.' : undefined;

  async function save() {
    if (nameError || saving) return;

    const nextName = name.trim();
    if (nextName !== user.name) {
      setSaving(true);
      setSaveError(null);
      try {
        await updateDisplayName(user.id, nextName);
      } catch (failure) {
        setSaveError(getDataErrorMessage(failure));
        setSaving(false);
        return;
      }
    }
    onClose();
  }

  return (
    <Sheet
      visible
      title="Editar perfil"
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} disabled={saving} style={styles.footerButton} />
          <Button
            label="Salvar"
            onPress={save}
            disabled={!!nameError || saving}
            icon={saving ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : undefined}
            style={styles.footerButton}
          />
        </>
      }>
      <View style={styles.content}>
        <TextField
          label="Nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          error={nameError ?? saveError ?? undefined}
        />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  footerButton: {
    flex: 1,
  },
});
