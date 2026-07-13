import { act, renderHook } from '@testing-library/react-native';

import { useAuthStore } from '@/features/user/store/use-auth-store';

import { useSubmitReview } from '../use-submit-review';

import { useReviewStore } from '../../store/use-review-store';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'ja' } }),
}));

describe('useSubmitReview', () => {
  beforeEach(() => {
    useReviewStore.setState({ submittedReviews: {} });
    useAuthStore.getState().logout();
  });

  it('入力に投稿者・id・投稿日時・言語を付与してストアに追加する', () => {
    useAuthStore.getState().login({ name: '荒川蓮', iconUrl: 'https://i.pravatar.cc/150?img=68' });
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
