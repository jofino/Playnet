import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { CityPicker } from '@/components/city-picker';
import { Sheet } from '@/components/sheet';
import { TextField } from '@/components/text-field';
import { Colors, Spacing } from '@/constants/theme';
import type { City } from '@/data/cities';
import { getDataErrorMessage } from '@/lib/data-errors';
import { updateDisplayName, updateProfileCity } from '@/lib/perfis';
import { useUser } from '@/state/user-context';

/** Edição do que existe na tabela de perfis: o nome e a cidade. */
export function EditProfileSheet({ onClose }: { onClose: () => void }) {
  const { user, updateUser, profileLoading } = useUser();
  const [name, setName] = useState(user.name);
  // `undefined`: ainda não mexeu, então vale a cidade do perfil e nada é gravado.
  const [cityChoice, setCityChoice] = useState<City | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const nameError = name.trim() === '' ? 'Informe seu nome.' : undefined;
  const city = cityChoice === undefined ? user.city : cityChoice;

  async function save() {
    if (nameError || saving) return;

    const nextName = name.trim();
    const nameChanged = nextName !== user.name;
    const cityChanged = cityChoice !== undefined && cityChoice?.id !== user.city?.id;
    if (nameChanged || cityChanged) {
      setSaving(true);
      setSaveError(null);
      try {
        if (nameChanged) await updateDisplayName(user.id, nextName);
        if (cityChanged) {
          await updateProfileCity(user.id, cityChoice);
          updateUser({ city: cityChoice });
        }
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
          error={nameError}
        />
        {profileLoading && cityChoice === undefined ? (
          <ActivityIndicator size="small" color={Colors.primary} accessibilityLabel="Carregando a cidade" />
        ) : (
          <CityPicker value={city} onChange={setCityChoice} disabled={saving} />
        )}
        {!!saveError && (
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {saveError}
          </Text>
        )}
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
  },
  footerButton: {
    flex: 1,
  },
});
