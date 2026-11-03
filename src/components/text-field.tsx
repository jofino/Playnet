import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Mensagem de erro exibida abaixo do campo. */
  error?: string;
  /** Elemento dentro do campo, à direita (ex.: botão de mostrar a senha). */
  trailing?: ReactNode;
};

/** Campo de texto de formulário com rótulo. */
export function TextField({ label, error, trailing, style, ...props }: TextFieldProps) {
  const input = (
    <TextInput
      accessibilityLabel={label}
      placeholderTextColor={Colors.textSecondary}
      style={[styles.input, !!error && styles.inputError, !!trailing && styles.inputWithTrailing, style]}
      {...props}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {trailing ? (
        <View>
          {input}
          <View style={styles.trailing}>{trailing}</View>
        </View>
      ) : (
        input
      )}
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
  // Reserva o espaço do elemento à direita para o texto não passar por baixo dele.
  inputWithTrailing: {
    paddingRight: Spacing.six,
  },
  trailing: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: Spacing.three,
    justifyContent: 'center',
  },
  error: {
    color: '#D92D20',
    fontSize: 13,
  },
});
