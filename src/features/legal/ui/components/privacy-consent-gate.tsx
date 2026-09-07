import type { PropsWithChildren } from 'react';

import { usePrivacyConsent } from '../../application/use-privacy-consent';

import { PrivacyConsentScreen } from './privacy-consent-screen';

/**
 * プライバシーポリシーへの同意を得るまで子要素を描画しないゲート。
 *
 * 未同意の間はアプリ本体（ルーティング・API 呼び出し）を一切マウントしない。
 * 読み出し中は起動スプラッシュが覆っているため何も描画しない。
 */
export function PrivacyConsentGate({ children }: PropsWithChildren) {
  const { status, accept } = usePrivacyConsent();

  if (status === 'loading') {
    return null;
  }

  if (status === 'required') {
    return <PrivacyConsentScreen onAccept={accept} />;
  }

  return <>{children}</>;
}
