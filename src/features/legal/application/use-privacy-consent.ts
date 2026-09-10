import { useCallback, useEffect, useState } from 'react';

import {
  type ConsentStore,
  isConsentCurrent,
  PRIVACY_POLICY_VERSION,
} from '../domain/privacy-policy';

import { defaultConsentStore } from './consent-deps';

/**
 * 同意状態。
 *
 * - `loading`: 端末内の保存値を読み出し中
 * - `required`: 未同意、または同意済みの版数が古い（再同意が必要）
 * - `granted`: 現在の版数に同意済み
 */
export type ConsentStatus = 'loading' | 'required' | 'granted';

export type PrivacyConsent = {
  status: ConsentStatus;
  /** 現在の版数への同意を記録する。保存に失敗した場合は状態を変えない。 */
  accept: () => Promise<void>;
};

/**
 * プライバシーポリシーへの同意状態を管理するフック。
 *
 * 起動時に保存済みの同意を読み出し、版数が現在のものと一致する場合のみ `granted` にする。
 * 保存に失敗したまま `granted` にすると次回起動時に再び同意を求めることになり、
 * 「同意した」という記録が残らないため、保存が成功した場合にのみ状態を進める。
 */
export function usePrivacyConsent(store: ConsentStore = defaultConsentStore): PrivacyConsent {
  const [status, setStatus] = useState<ConsentStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      let granted = false;
      try {
        granted = isConsentCurrent(await store.loadConsent());
      } catch {
        // 読み出しに失敗した場合は未同意として扱い、同意を求める。
        granted = false;
      }

      if (!cancelled) {
        setStatus(granted ? 'granted' : 'required');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [store]);

  const accept = useCallback(async () => {
    await store.saveConsent({
      version: PRIVACY_POLICY_VERSION,
      agreedAt: new Date().toISOString(),
    });
    setStatus('granted');
  }, [store]);

  return { status, accept };
}
