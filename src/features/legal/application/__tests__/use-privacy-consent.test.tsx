import { act, renderHook, waitFor } from '@testing-library/react-native';

import type { ConsentStore, PolicyConsent } from '../../domain/privacy-policy';
import { PRIVACY_POLICY_VERSION } from '../../domain/privacy-policy';
import { usePrivacyConsent } from '../use-privacy-consent';

const createStore = (overrides: Partial<ConsentStore> = {}): ConsentStore => ({
  loadConsent: jest.fn<Promise<PolicyConsent | null>, []>().mockResolvedValue(null),
  saveConsent: jest.fn<Promise<void>, [PolicyConsent]>().mockResolvedValue(undefined),
  ...overrides,
});

describe('usePrivacyConsent', () => {
  it('現在の版数に同意済みなら granted になる', async () => {
    const store = createStore({
      loadConsent: jest.fn().mockResolvedValue({
        version: PRIVACY_POLICY_VERSION,
        agreedAt: '2026-09-07T00:00:00.000Z',
      }),
    });

    const { result } = renderHook(() => usePrivacyConsent(store));

    await waitFor(() => expect(result.current.status).toBe('granted'));
  });

  it('未同意なら required になる', async () => {
    const { result } = renderHook(() => usePrivacyConsent(createStore()));

    await waitFor(() => expect(result.current.status).toBe('required'));
  });

  it('保存済みの版数が古い場合は再同意を求める', async () => {
    const store = createStore({
      loadConsent: jest
        .fn()
        .mockResolvedValue({ version: '2000-01-01', agreedAt: '2000-01-01T00:00:00.000Z' }),
    });

    const { result } = renderHook(() => usePrivacyConsent(store));

    await waitFor(() => expect(result.current.status).toBe('required'));
  });

  it('読み出しに失敗した場合は未同意として扱う', async () => {
    const store = createStore({
      loadConsent: jest.fn().mockRejectedValue(new Error('storage unavailable')),
    });

    const { result } = renderHook(() => usePrivacyConsent(store));

    await waitFor(() => expect(result.current.status).toBe('required'));
  });

  it('accept で現在の版数と同意日時を保存し granted になる', async () => {
    const store = createStore();
    const { result } = renderHook(() => usePrivacyConsent(store));
    await waitFor(() => expect(result.current.status).toBe('required'));

    await act(async () => {
      await result.current.accept();
    });

    expect(store.saveConsent).toHaveBeenCalledWith({
      version: PRIVACY_POLICY_VERSION,
      agreedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
    expect(result.current.status).toBe('granted');
  });

  it('保存に失敗した場合は granted にせず呼び出し元へ例外を伝える', async () => {
    const store = createStore({
      saveConsent: jest.fn().mockRejectedValue(new Error('write failed')),
    });
    const { result } = renderHook(() => usePrivacyConsent(store));
    await waitFor(() => expect(result.current.status).toBe('required'));

    await act(async () => {
      await expect(result.current.accept()).rejects.toThrow('write failed');
    });

    expect(result.current.status).toBe('required');
  });
});
