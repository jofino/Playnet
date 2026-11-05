import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { Colors, Spacing } from '@/constants/theme';
import { formatCity, type City } from '@/data/cities';
import { useCitySearch } from '@/hooks/use-city-search';

type CityPickerProps = {
  value: City | null;
  /** `null` limpa a cidade escolhida e volta para a busca. */
  onChange: (city: City | null) => void;
  disabled?: boolean;
};

/** Seletor de cidade: busca pelo começo do nome e mostra "Nome, UF". */
export function CityPicker({ value, onChange, disabled = false }: CityPickerProps) {
  const [changing, setChanging] = useState(false);

  if (!value) {
    return <CitySearch autoFocus={changing} disabled={disabled} onSelect={onChange} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Cidade</Text>
      <View style={styles.selected}>
        <Text style={styles.selectedText} numberOfLines={1}>
          {formatCity(value)}
        </Text>
        <Pressable
          onPress={() => {
            setChanging(true);
            onChange(null);
          }}
          disabled={disabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Trocar a cidade ${formatCity(value)}`}>
          <Text style={styles.change}>Trocar</Text>
        </Pressable>
      </View>
    </View>
  );
}

type CitySearchProps = {
  autoFocus: boolean;
  disabled: boolean;
  onSelect: (city: City) => void;
};

function CitySearch({ autoFocus, disabled, onSelect }: CitySearchProps) {
  const { term, setTerm, searchable, loading, cities, error, retry } = useCitySearch();

  return (
    <View style={styles.container}>
      <TextField
        label="Cidade"
        value={term}
        onChangeText={setTerm}
        editable={!disabled}
        autoFocus={autoFocus}
        placeholder="Digite ao menos 2 letras"
        autoCapitalize="words"
        autoCorrect={false}
      />
      {loading ? (
        <ActivityIndicator
          size="small"
          color={Colors.primary}
          style={styles.message}
          accessibilityLabel="Buscando cidades"
        />
      ) : error ? (
        <View style={styles.message}>
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
          </Text>
          <Button label="Tentar de novo" size="small" variant="outline" onPress={retry} />
        </View>
      ) : searchable && cities.length === 0 ? (
        <Text style={[styles.empty, styles.message]}>Nenhuma cidade encontrada</Text>
      ) : (
        cities.length > 0 && (
          <View style={styles.results}>
            {cities.map((city) => (
              <Pressable
                key={city.id}
                onPress={() => onSelect(city)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={formatCity(city)}
                style={({ pressed }) => [styles.result, pressed && styles.pressed]}>
                <Text style={styles.resultText}>{formatCity(city)}</Text>
              </Pressable>
            ))}
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one + Spacing.half,
  },
  label: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: 700,
  },
  selected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    height: 46,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedText: {
    flexShrink: 1,
    color: Colors.text,
    fontSize: 16,
  },
  change: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 700,
  },
  message: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  empty: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
    textAlign: 'center',
  },
  results: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  result: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three - Spacing.one,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  pressed: {
    backgroundColor: Colors.backgroundElement,
  },
  resultText: {
    color: Colors.text,
    fontSize: 15,
  },
});
