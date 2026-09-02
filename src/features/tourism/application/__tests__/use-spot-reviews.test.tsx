import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { fetchReviews } from '../../infrastructure/api/review-api';
import { useReviewStore } from '../../store/use-review-store';
import { mergeReviews, useSpotReviews, SPOT_REVIEWS_QUERY_KEY } from '../use-spot-reviews';

import type { Review } from '../../domain/review';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'ja' } }),
}));

jest.mock('../../infrastructure/api/review-api', () => ({
  fetchReviews: jest.fn(),
}));

const mockFetchReviews = jest.mocked(fetchReviews);

function review(id: string, postedAt: string): Review {
  return {
    id,
    rating: { value: 5 },
    comment: id,
    author: { id: 'author-n', name: 'n', iconUrl: 'https://example.com/a.png' },
    postedAt,
    language: 'ja',
  };
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return { Wrapper, queryClient };
}

describe('mergeReviews', () => {
  it('seed と投稿を結合し、投稿日時の新しい順に並べる', () => {
    const seed = [review('a', '2025-01-01T00:00:00.000Z'), review('b', '2025-03-01T00:00:00.000Z')];
    const submitted = [review('c', '2026-06-29T00:00:00.000Z')];

    expect(mergeReviews(seed, submitted).map((r) => r.id)).toEqual(['c', 'b', 'a']);
  });

  it('空同士なら空配列を返す', () => {
    expect(mergeReviews([], [])).toEqual([]);
  });

  it('オフセット表記が混在しても実際の時刻の新しい順に並べる', () => {
    // 文字列比較では 'Z'(0x5A) > '+'(0x2B) のため 'later' が後ろに来てしまうが、
    // 実時刻では later(00:30Z) の方が earlier(09:00+09:00 = 00:00Z) より新しい。
    const seed = [review('earlier', '2025-05-01T09:00:00.000+09:00')];
    const submitted = [review('later', '2025-05-01T00:30:00.000Z')];

    expect(mergeReviews(seed, submitted).map((r) => r.id)).toEqual(['later', 'earlier']);
  });

  it('seed と submitted に同一 id があれば重複させず submitted を優先する', () => {
    // API が投稿済みレビューを返しても、ローカルの編集内容を優先して 1 件にまとめる。
    const seed = [review('dup', '2025-01-01T00:00:00.000Z')];
    const submitted = [{ ...review('dup', '2026-01-01T00:00:00.000Z'), comment: 'edited' }];

    const result = mergeReviews(seed, submitted);

    expect(result).toHaveLength(1);
    expect(result[0].comment).toBe('edited');
  });
});

describe('useSpotReviews', () => {
  beforeEach(() => {
    mockFetchReviews.mockReset();
    useReviewStore.setState({ submittedReviews: {} });
  });

  it('解決した言語と signal を渡して fetchReviews を呼び、取得結果を返す', async () => {
    const apiReviews = [review('r1', '2025-05-01T00:00:00.000Z')];
    mockFetchReviews.mockResolvedValue(apiReviews);
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSpotReviews('nankinmachi'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.data).toEqual(apiReviews);
    expect(mockFetchReviews).toHaveBeenCalledWith('nankinmachi', 'ja', expect.any(AbortSignal));
  });

  it('取得に失敗すると isError が true になる', async () => {
    mockFetchReviews.mockRejectedValueOnce(new Error('offline'));
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSpotReviews('nankinmachi'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('spotId が未指定のときは取得せず空配列を返す', () => {
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSpotReviews(null), { wrapper: Wrapper });

    expect(mockFetchReviews).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  it('ローカルストアの投稿分を API 取得分に重ねて新しい順で返す', async () => {
    mockFetchReviews.mockResolvedValue([review('api-old', '2025-01-01T00:00:00.000Z')]);
    useReviewStore.setState({
      submittedReviews: { nankinmachi: [review('local-new', '2026-01-01T00:00:00.000Z')] },
    });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useSpotReviews('nankinmachi'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.data.map((r) => r.id)).toEqual(['local-new', 'api-old']);
  });

  it('queryKey に解決した言語を含める', async () => {
    mockFetchReviews.mockResolvedValue([]);
    const { Wrapper, queryClient } = createWrapper();

    const { result } = renderHook(() => useSpotReviews('nankinmachi'), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    const keys = queryClient
      .getQueryCache()
      .getAll()
      .map((query) => query.queryKey);
    expect(keys).toContainEqual([...SPOT_REVIEWS_QUERY_KEY, 'nankinmachi', 'ja']);
  });
});
