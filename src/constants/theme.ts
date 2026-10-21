/**
 * Cores do app. O Playnet usa um tema único: fundo branco com o laranja da marca.
 */

import '@/global.css';

import { Platform } from 'react-native';

/** Laranja da logo oficial (assets/images/brand/playnet-logo.jpg). */
const PlaynetOrange = '#E05434';

export const Colors = {
  text: '#11181C',
  background: '#ffffff',
  backgroundElement: '#F0F0F3',
  backgroundSelected: '#E0E1E6',
  textSecondary: '#60646C',
  border: '#E4E4E7',
  primary: PlaynetOrange,
  primarySoft: '#F9DDD6',
  onPrimary: '#ffffff',
} as const;

export type ThemeColor = keyof typeof Colors;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Altura da barra de abas nativa (iOS/Android). */
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
/** Barras de abas da web (ver app-tabs.web.tsx): no topo em telas largas, embaixo nas estreitas. */
export const WebTopTabBarHeight = 76;
export const WebBottomTabBarHeight = 64;
/** A partir desta largura a web usa o layout de desktop. */
export const WideLayoutMinWidth = 768;
export const MaxContentWidth = 800;
