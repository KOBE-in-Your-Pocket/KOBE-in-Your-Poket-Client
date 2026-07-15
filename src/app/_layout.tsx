import { Stack } from 'expo-router';

import { createMockMannerRepository, MannerRepositoryProvider } from '@/features/manner';
import { useRestoreSession } from '@/features/user';
import { AppProviders } from '@/shared/ui';

const mannerRepository = createMockMannerRepository();

export default function RootLayout() {
  useRestoreSession();

  return (
    <AppProviders>
      <MannerRepositoryProvider repository={mannerRepository}>
        <Stack screenOptions={{ headerShown: false }} />
      </MannerRepositoryProvider>
    </AppProviders>
  );
}
