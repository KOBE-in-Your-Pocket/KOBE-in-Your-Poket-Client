import { Stack } from 'expo-router';

import { createMockMannerRepository, MannerRepositoryProvider } from '@/features/manner';
import { createAuthTokenProvider, useRestoreSession } from '@/features/user';
import { warnIfApiBaseUrlMissing } from '@/shared/config';
import { setAuthTokenProvider } from '@/shared/lib/api';
import { AppProviders } from '@/shared/ui';

warnIfApiBaseUrlMissing();

// 認証付き API 呼び出しのトークン供給を composition root で注入する（#506）。
setAuthTokenProvider(createAuthTokenProvider());

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
