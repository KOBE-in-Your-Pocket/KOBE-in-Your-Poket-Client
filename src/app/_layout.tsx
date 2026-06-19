import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { I18nextProvider } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { initI18n } from '@/shared/lib/i18n';
import { AnimatedSplashOverlay } from '@/shared/ui';

const i18n = initI18n();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </I18nextProvider>
  );
}
