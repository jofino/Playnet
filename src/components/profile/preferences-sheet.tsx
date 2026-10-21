import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Sheet } from '@/components/sheet';
import { SPORT_PREFERENCES, type PreferenceKey } from '@/constants/sport-preferences';
import type { Sport } from '@/constants/sports';
import { Colors, Spacing } from '@/constants/theme';

type Preferences = Partial<Record<PreferenceKey, string>>;

type PreferencesSheetProps = {
  sport: Sport;
  initial: Preferences;
  onClose: () => void;
  onSave: (preferences: Preferences) => void;
};

/** Edição das preferências de jogador em um esporte. */
export function PreferencesSheet({ sport, initial, onClose, onSave }: PreferencesSheetProps) {
  const [draft, setDraft] = useState<Preferences>(initial);

  // Tocar de novo na opção escolhida volta para "Não definido".
  function toggle(key: PreferenceKey, option: string) {
    setDraft((current) => ({ ...current, [key]: current[key] === option ? undefined : option }));
  }

  function save() {
    onSave(draft);
    onClose();
  }

  return (
    <Sheet
      visible
      title={`Preferências · ${sport}`}
      onClose={onClose}
      footer={
        <>
          <Button label="Cancelar" variant="outline" onPress={onClose} style={styles.footerButton} />
          <Button label="Salvar" onPress={save} style={styles.footerButton} />
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
                  key={option}
                  label={option}
                  selected={draft[preference.key] === option}
                  onPress={() => toggle(preference.key, option)}
                />
              ))}
            </View>
          </View>
        ))}
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
  footerButton: {
    flex: 1,
  },
});
