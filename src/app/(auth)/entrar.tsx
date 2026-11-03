import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AUTH_MAX_WIDTH } from '@/components/auth/auth-step-screen';
import { FacebookIcon, GoogleIcon } from '@/components/auth/provider-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useAuthFlow } from '@/lib/auth-flow-context';

// Proporção (largura / altura) de playnet-wordmark-orange.png.
const WORDMARK_ASPECT_RATIO = 1081 / 286;

export default function EntrarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { start } = useAuthFlow();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.four },
      ]}>
      <View style={styles.body}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Image
              source={require('@/assets/images/brand/playnet-emblem-white.png')}
              style={styles.emblem}
              contentFit="contain"
            />
          </View>
          <Image
            source={require('@/assets/images/brand/playnet-wordmark-orange.png')}
            style={styles.wordmark}
            contentFit="contain"
            accessibilityLabel="Playnet"
          />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title} accessibilityRole="header">
            Entrar ou criar conta
          </Text>
          <Text style={styles.subtitle}>Sua próxima partida começa aqui</Text>
        </View>

        <View style={styles.options}>
          {/* Google e Facebook ainda sem funcionalidade: só o visual está pronto. */}
          <OptionButton icon={<GoogleIcon />} label="Continuar com Google" />
          <OptionButton icon={<FacebookIcon />} label="Continuar com Facebook" />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <OptionButton
            icon={
              <SymbolView
                name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                tintColor={Colors.text}
                size={24}
              />
            }
            label="Continuar com email"
            onPress={() => {
              start();
              router.push('/email');
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function OptionButton({
  icon,
  label,
  onPress,
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
      {icon}
      <Text style={styles.optionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  body: {
    width: '100%',
    maxWidth: AUTH_MAX_WIDTH,
    alignSelf: 'center',
    gap: Spacing.five,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  // A imagem já vem com o centro de massa do emblema no centro, para ele ficar centrado no círculo.
  emblem: {
    width: 84,
    height: 84,
  },
  wordmark: {
    height: 46,
    aspectRatio: WORDMARK_ASPECT_RATIO,
  },
  heading: {
    alignItems: 'center',
    gap: Spacing.two,
  },
  title: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: 800,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  options: {
    gap: Spacing.three,
  },
  option: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three - Spacing.one,
    paddingHorizontal: Spacing.three,
    backgroundColor: Colors.backgroundElement,
  },
  optionLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 700,
  },
  pressed: {
    opacity: 0.7,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
});
