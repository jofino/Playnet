import { SymbolView } from 'expo-symbols';
import { useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { TextField } from '@/components/text-field';
import { Colors } from '@/constants/theme';

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, 'secureTextEntry' | 'trailing'>;

/** Campo de senha com botão para mostrar e ocultar o que foi digitado. */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!visible}
      trailing={
        <Pressable
          onPress={() => setVisible((current) => !current)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? `Ocultar ${props.label}` : `Mostrar ${props.label}`}
          style={({ pressed }) => pressed && styles.pressed}>
          <SymbolView
            name={
              visible
                ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                : { ios: 'eye', android: 'visibility', web: 'visibility' }
            }
            tintColor={Colors.textSecondary}
            size={24}
          />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
});
