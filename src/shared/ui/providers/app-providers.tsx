import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '../branding/animated-icon';

import { useLanguageBootstrap } from './use-language-bootstrap';

import { initI18n } from '@/shared/lib/i18n';
import { createQueryClient } from '@/shared/lib/query';

const i18n = initI18n();
const queryClient = createQueryClient();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();
  useLanguageBootstrap();
  return (
<<<<<<< HEAD
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
=======
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
>>>>>>> 0f530f0 (feat: 観光スポット一覧コンポーネント SpotList を実装 #26)
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          {children}
        </ThemeProvider>
<<<<<<< HEAD
      </I18nextProvider>
    </QueryClientProvider>
=======
      </QueryClientProvider>
    </I18nextProvider>
>>>>>>> 0f530f0 (feat: 観光スポット一覧コンポーネント SpotList を実装 #26)
  );
}
