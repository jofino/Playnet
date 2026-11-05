import { useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Colors, Spacing } from '@/constants/theme';

/** Largura máxima do conteúdo em telas largas. */
export const AUTH_MAX_WIDTH = 440;

/** Aparência dos campos de texto nas etapas de login e cadastro. */
export const authInputStyle = {
  height: 56,
  backgroundColor: Colors.backgroundElement,
};

type AuthStepScreenProps = {
  icon: SymbolViewProps['name'];
  title: string;
  subtitle?: string;
  /** Erro do envio, exibido abaixo dos campos. */
  error?: string | null;
  /** Aviso de sucesso, exibido abaixo dos campos. */
  notice?: string | null;
  /** Texto do botão no rodapé. Sem ele, a etapa não tem rodapé. */
  submitLabel?: string;
  canSubmit?: boolean;
  submitting?: boolean;
  onSubmit?: () => void;
  children: ReactNode;
};

/**
 * Uma etapa de login ou cadastro: seta de voltar, ícone, título, conteúdo
 * e o botão de avançar no rodapé, que sobe junto com o teclado.
 */
export function AuthStepScreen({
  icon,
  title,
  subtitle,
  error,
  notice,
  submitLabel,
  canSubmit = true,
  submitting = false,
  onSubmit,
  children,
}: AuthStepScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    // "padding" nas duas plataformas: com o Android sem barras opacas (edge-to-edge),
    // a janela não encolhe sozinha quando o teclado abre.
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
        <Pressable
          onPress={() => router.back()}
          disabled={submitting}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
          <SymbolView
            name={{ ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' }}
            tintColor={Colors.text}
            size={26}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}>
        <View style={styles.iconCircle}>
          <SymbolView name={icon} tintColor={Colors.primary} size={44} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={[styles.fields, submitting && styles.fieldsBusy]}>{children}</View>

        {!!error && (
          <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
            {error}
          </Text>
        )}
        {!!notice && (
          <Text style={styles.notice} accessibilityLiveRegion="polite">
            {notice}
          </Text>
        )}
      </ScrollView>

      {!!submitLabel && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.three }]}>
          <Button
            label={submitLabel}
            onPress={onSubmit}
            disabled={!canSubmit || submitting}
            icon={submitting ? <ActivityIndicator size="small" color={Colors.onPrimary} /> : undefined}
            style={styles.submit}
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    width: '100%',
    maxWidth: AUTH_MAX_WIDTH + Spacing.four * 2,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  back: {
    alignSelf: 'flex-start',
  },
  pressed: {
    opacity: 0.7,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: AUTH_MAX_WIDTH + Spacing.four * 2,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  heading: {
    gap: Spacing.two,
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: 800,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  fields: {
    gap: Spacing.three,
  },
  fieldsBusy: {
    opacity: 0.6,
  },
  error: {
    padding: Spacing.three - Spacing.one,
    borderRadius: 12,
    backgroundColor: '#FEF3F2',
    color: '#D92D20',
    fontSize: 14,
  },
  notice: {
    padding: Spacing.three - Spacing.one,
    borderRadius: 12,
    backgroundColor: Colors.primarySoft,
    color: Colors.text,
    fontSize: 14,
  },
  footer: {
    width: '100%',
    maxWidth: AUTH_MAX_WIDTH + Spacing.four * 2,
    alignSelf: 'center',
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  submit: {
    height: 52,
    borderRadius: 26,
  },
});
