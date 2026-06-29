import { act, renderHook } from '@testing-library/react-native';

import { useSubmitReview } from '../use-submit-review';

import { useReviewStore } from '../../store/use-review-store';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'ja' } }),
}));

describe('useSubmitReview', () => {
  beforeEach(() => {
    useReviewStore.setState({ submittedReviews: {} });
  });

  it('入力に投稿者・id・投稿日時・言語を付与してストアに追加する', () => {
    const { result } = renderHook(() => useSubmitReview('spot-a'));

    act(() => {
      result.current({ rating: { value: 4 }, comment: 'よかった' });
    });

    const list = useReviewStore.getState().submittedReviews['spot-a'];
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({
      rating: { value: 4 },
      comment: 'よかった',
      language: 'ja',
    });
    expect(list[0].id).toBeTruthy();
    expect(list[0].author.name).toBeTruthy();
    expect(list[0].postedAt).toBeTruthy();
  });
});
