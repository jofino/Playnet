import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Sheet } from '@/components/sheet';
import { Colors, Spacing } from '@/constants/theme';

export type SelectOption<T extends string> = { value: T; label: string };

type SelectFieldProps<T extends string> = {
  label: string;
  value: T | null;
  options: SelectOption<T>[];
  /** Texto da opção que limpa a seleção (valor `null`), ex.: "Todos os estados". */
  allLabel: string;
  disabled?: boolean;
  onChange: (value: T | null) => void;
};

/**
 * Campo de seleção: mostra o valor atual e abre uma lista de opções
 * (painel inferior no celular, janela centralizada em telas largas).
 */
export function SelectField<T extends string>({
  label,
  value,
  options,
  allLabel,
  disabled = false,
  onChange,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);

  const items: { value: T | null; label: string }[] = [{ value: null, label: allLabel }, ...options];
  const selectedLabel = options.find((option) => option.value === value)?.label ?? allLabel;

  function select(next: T | null) {
    setOpen(false);
    onChange(next);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedLabel}`}
        accessibilityState={{ disabled }}
        style={({ pressed }) => [styles.field, disabled && styles.disabled, pressed && styles.pressed]}>
        <View style={styles.fieldTexts}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue} numberOfLines={1}>
            {selectedLabel}
          </Text>
        </View>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          tintColor={Colors.textSecondary}
          size={20}
        />
      </Pressable>

      <Sheet visible={open} title={label} onClose={() => setOpen(false)}>
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <Pressable
              key={item.value ?? 'all'}
              onPress={() => select(item.value)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                {item.label}
              </Text>
              {selected && (
                <SymbolView
                  name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                  tintColor={Colors.primary}
                  size={20}
                />
              )}
            </Pressable>
          );
        })}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.7,
  },
  fieldTexts: {
    flex: 1,
  },
  fieldLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  fieldValue: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: 600,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  optionPressed: {
    backgroundColor: Colors.backgroundElement,
  },
  optionText: {
    color: Colors.text,
    fontSize: 16,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: 700,
  },
});
