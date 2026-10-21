import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Chip } from '@/components/chip';
import { SportIcon } from '@/components/sport-icon';
import { SUPPORTED_SPORTS, type Sport } from '@/constants/sports';
import { Spacing } from '@/constants/theme';

type SportChipsProps = { style?: StyleProp<ViewStyle> } & (
  | { value: Sport; onChange: (sport: Sport) => void; allLabel?: undefined }
  | {
      value: Sport | null;
      onChange: (sport: Sport | null) => void;
      /** Mostra antes dos esportes um chip que limpa a seleção (valor `null`). */
      allLabel: string;
    }
);

/** Seletor de esporte com um chip (ícone + nome) para cada esporte suportado. */
export function SportChips({ value, onChange, allLabel, style }: SportChipsProps) {
  return (
    <View style={[styles.row, style]}>
      {allLabel !== undefined && (
        <Chip
          label={allLabel}
          selected={value === null}
          onPress={() => (onChange as (sport: Sport | null) => void)(null)}
        />
      )}
      {SUPPORTED_SPORTS.map((sport) => (
        <Chip
          key={sport}
          label={sport}
          icon={<SportIcon sport={sport} />}
          selected={sport === value}
          onPress={() => onChange(sport)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
