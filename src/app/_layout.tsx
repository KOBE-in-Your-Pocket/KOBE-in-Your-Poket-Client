import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { createMockMannerRepository, MannerRepositoryProvider } from '@/features/manner';
import { useAuthStore, useRestoreSession } from '@/features/user';
import { warnIfApiBaseUrlMissing } from '@/shared/config';
import { AppProviders } from '@/shared/ui';

warnIfApiBaseUrlMissing();

const mannerRepository = createMockMannerRepository();

export default function RootLayout() {
  useRestoreSession();

  // TODO(#402 UI確認用・コミット禁止): 一時モックログイン
  useEffect(() => {
    useAuthStore.getState().login({ id: 'mock-user', name: 'モック 太郎', iconUrl: '' });
  }, []);

  return (
    <AppProviders>
      <MannerRepositoryProvider repository={mannerRepository}>
        <Stack screenOptions={{ headerShown: false }} />
      </MannerRepositoryProvider>
    </AppProviders>
  );
}
