import { apiFetch } from '@/shared/lib/api';

import type { Review } from '../../../domain/review';
import { fetchReviews } from '../review-api';

jest.mock('@/shared/lib/api', () => ({
  apiFetch: jest.fn(),
}));

const mockApiFetch = jest.mocked(apiFetch);

function review(id: string): Review {
  return {
    id,
    rating: { value: 5 },
    comment: id,
    author: { id: 'author-1', name: 'n', iconUrl: 'https://example.com/a.png' },
    postedAt: '2025-05-01T00:00:00.000Z',
    language: 'ja',
  };
}

describe('fetchReviews', () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it('spotId をエンコードしたパスと lang クエリ・signal で apiFetch を呼ぶ', async () => {
    mockApiFetch.mockResolvedValue([]);
    const signal = new AbortController().signal;

    await fetchReviews('spot/with space', 'ja', signal);

    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/tourism/spots/spot%2Fwith%20space/reviews', {
      query: { lang: 'ja' },
      signal,
    });
  });

  it('signal 未指定でも呼び出せる（undefined を渡す）', async () => {
    mockApiFetch.mockResolvedValue([]);

    await fetchReviews('nankinmachi', 'en');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/tourism/spots/nankinmachi/reviews', {
      query: { lang: 'en' },
      signal: undefined,
    });
  });

  it('apiFetch の結果をそのまま返す', async () => {
    const reviews = [review('r1'), review('r2')];
    mockApiFetch.mockResolvedValue(reviews);

    await expect(fetchReviews('nankinmachi', 'ja')).resolves.toEqual(reviews);
  });
});
