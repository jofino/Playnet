import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Mensagem de erro exibida abaixo do campo. */
  error?: string;
};

/** Campo de texto de formulário com rótulo. */
export function TextField({ label, error, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={Colors.textSecondary}
        style={[styles.input, !!error && styles.inputError, style]}
        {...props}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
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
  input: {
    height: 46,
    minWidth: 0,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#D92D20',
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
  },
});
