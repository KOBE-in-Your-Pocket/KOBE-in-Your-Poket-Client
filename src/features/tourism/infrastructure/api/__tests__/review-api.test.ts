import { apiFetch } from '@/shared/lib/api';

import { fetchReviews } from '../review-api';

jest.mock('@/shared/lib/api', () => ({
  apiFetch: jest.fn(),
}));

const mockApiFetch = jest.mocked(apiFetch);

/** Backend レスポンス（author は name のみ返す想定）の 1 件を組み立てる。 */
function response(author: { name: string; id?: string | null; iconUrl?: string | null }) {
  return {
    id: 'r1',
    rating: { value: 4 },
    comment: 'コメント',
    author,
    postedAt: '2025-05-01T00:00:00.000Z',
    language: 'ja',
  };
}

describe('fetchReviews', () => {
  beforeEach(() => {
    mockApiFetch.mockReset();
  });

  it('encodeURIComponent したパスと lang クエリで apiFetch を呼ぶ', async () => {
    mockApiFetch.mockResolvedValue([]);

    await fetchReviews('spot/with space', 'en');

    expect(mockApiFetch).toHaveBeenCalledWith('/api/v1/tourism/spots/spot%2Fwith%20space/reviews', {
      query: { lang: 'en' },
    });
  });

  it('author が name のみのとき id / iconUrl をフォールバック（空文字）で補う', async () => {
    mockApiFetch.mockResolvedValue([response({ name: '山田 太郎' })]);

    const [review] = await fetchReviews('nankinmachi', 'ja');

    expect(review.author).toEqual({ id: '', name: '山田 太郎', iconUrl: '' });
  });

  it('backend が id / iconUrl を返す場合はその値をそのまま採用する', async () => {
    mockApiFetch.mockResolvedValue([
      response({ name: '花子', id: 'user-9', iconUrl: 'https://example.com/a.png' }),
    ]);

    const [review] = await fetchReviews('nankinmachi', 'ja');

    expect(review.author).toEqual({
      id: 'user-9',
      name: '花子',
      iconUrl: 'https://example.com/a.png',
    });
  });

  it('id / iconUrl が null のときもフォールバックする', async () => {
    mockApiFetch.mockResolvedValue([response({ name: '次郎', id: null, iconUrl: null })]);

    const [review] = await fetchReviews('nankinmachi', 'ja');

    expect(review.author).toEqual({ id: '', name: '次郎', iconUrl: '' });
  });

  it('author 以外のフィールドは変換せずそのまま保持する', async () => {
    mockApiFetch.mockResolvedValue([response({ name: '太郎' })]);

    const [review] = await fetchReviews('nankinmachi', 'ja');

    expect(review).toMatchObject({
      id: 'r1',
      rating: { value: 4 },
      comment: 'コメント',
      postedAt: '2025-05-01T00:00:00.000Z',
      language: 'ja',
    });
  });
});
