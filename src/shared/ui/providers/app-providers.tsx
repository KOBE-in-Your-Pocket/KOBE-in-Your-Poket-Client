import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '../branding/animated-icon';

import { initI18n } from '@/shared/lib/i18n';

const i18n = initI18n();

export function AppProviders({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}
