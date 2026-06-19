import { Stack } from 'expo-router';

import { AppProviders } from '@/shared/ui';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
    </AppProviders>
  );
}
