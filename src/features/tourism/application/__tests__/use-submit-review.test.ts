import { act, renderHook } from '@testing-library/react-native';

import { useAuthStore } from '@/features/user';

import { useSubmitReview } from '../use-submit-review';

import { useReviewStore } from '../../store/use-review-store';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'ja' } }),
}));

// user の公開 API（@/features/user）は SettingsScreen 経由で shared/ui バレル
// （Reanimated / react-native-maps 等のネイティブ UI）を巻き込む。このテストは
// 認証ストアだけ必要なので、重い UI バレルはスタブして読み込みを避ける。
jest.mock('@/shared/ui', () => ({
  ThemedText: () => null,
  ThemedView: () => null,
}));

// 同じく公開 API が AccountEditScreen 経由で expo-router を巻き込むためスタブする。
jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));

describe('useSubmitReview', () => {
  beforeEach(() => {
    useReviewStore.setState({ submittedReviews: {} });
    useAuthStore.getState().logout();
  });

  it('入力に投稿者・id・投稿日時・言語を付与してストアに追加する', () => {
    useAuthStore
      .getState()
      .login({ id: 'user-arakawa', name: '荒川蓮', iconUrl: 'https://i.pravatar.cc/150?img=68' });
    const { result } = renderHook(() => useSubmitReview('spot-a'));

    act(() => {
      result.current({
        rating: { value: 4 },
        comment: '景色がきれいで素晴らしかったです！また行きたいです。',
      });
    });

    const list = useReviewStore.getState().submittedReviews['spot-a'];
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      rating: { value: 4 },
      comment: '景色がきれいで素晴らしかったです！また行きたいです。',
      language: 'ja',
    });
    expect(list[0].id).toBeTruthy();
    expect(list[0].author.name).toBeTruthy();
    expect(list[0].postedAt).toBeTruthy();
  });

  it('未ログイン時は投稿しない', () => {
    const { result } = renderHook(() => useSubmitReview('spot-a'));

    act(() => {
      result.current({ rating: { value: 4 }, comment: '未ログインなので投稿されないはず。' });
    });

    expect(useReviewStore.getState().submittedReviews['spot-a']).toBeUndefined();
  });
});
