import type { PolicyConsent } from '../../domain/privacy-policy';

import { getItem, setItem } from '@/shared/lib/storage';

/** プライバシーポリシーへの同意記録を AsyncStorage に保存する際のキー。 */
export const CONSENT_STORAGE_KEY = 'legal.privacyPolicyConsent';

/** 保存済みの同意記録を読み出す。未保存・形式不正の場合は null を返す。 */
export async function loadConsent(): Promise<PolicyConsent | null> {
  const stored = await getItem<Partial<PolicyConsent>>(CONSENT_STORAGE_KEY);

  if (typeof stored?.version !== 'string' || typeof stored.agreedAt !== 'string') {
    return null;
  }

  return { version: stored.version, agreedAt: stored.agreedAt };
}

/** 同意記録を保存する。 */
export async function saveConsent(consent: PolicyConsent): Promise<void> {
  await setItem(CONSENT_STORAGE_KEY, consent);
}
