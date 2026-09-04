import { Stack } from 'expo-router';

import { createApiMannerRepository, MannerRepositoryProvider } from '@/features/manner';
import { useRestoreSession } from '@/features/user';
import { warnIfApiBaseUrlMissing } from '@/shared/config';
import { AppProviders } from '@/shared/ui';

warnIfApiBaseUrlMissing();

const mannerRepository = createApiMannerRepository();

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
