import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Sheet } from '@/components/sheet';
import { SPORT_PREFERENCES, type PreferenceKey } from '@/constants/sport-preferences';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';
import { getDataErrorMessage } from '@/lib/data-errors';

type Preferences = Partial<Record<PreferenceKey, string>>;

type PreferencesSheetProps = {
  sport: Sport;
  initial: Preferences;
  onClose: () => void;
  /** Grava as preferências; se falhar, o painel continua aberto e mostra o erro. */
  onSave: (preferences: Preferences) => Promise<void>;
};

/** Edição das preferências de jogador em um esporte. */
export function PreferencesSheet({ sport, initial, onClose, onSave }: PreferencesSheetProps) {
  const [draft, setDraft] = useState<Preferences>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tocar de novo na opção escolhida volta para "Não definido".
  function toggle(key: PreferenceKey, option: string) {
    setDraft((current) => ({ ...current, [key]: current[key] === option ? undefined : option }));
  }

  async function save() {
    if (saving) return;

    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      onClose();
    } catch (failure) {
      setError(getDataErrorMessage(failure));
      setSaving(false);
    }
  }

  return (
    <Sheet
      visible
      title={`Preferências · ${sport}`}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} disabled={saving} style={styles.footerButton} />
          <Button
            label="Salvar"
            onPress={save}
            disabled={saving}
            icon={saving ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : undefined}
            style={styles.footerButton}
          />
        </>
      }>
      <View style={styles.content}>
        {SPORT_PREFERENCES[sport].map((preference) => (
          <View key={preference.key} style={styles.group}>
            <Text style={styles.label}>
              {preference.emoji} {preference.label}
            </Text>
            <View style={styles.options}>
              {preference.options.map((option) => (
                <Chip
                  key={option.id}
                  label={option.label}
                  selected={draft[preference.key] === option.id}
                  onPress={() => toggle(preference.key, option.id)}
                />
              ))}
            </View>
          </View>
        ))}
        {!!error && (
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
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
  group: {
    gap: Spacing.two,
  },
  label: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 800,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
  },
  footerButton: {
    flex: 1,
  },
});
