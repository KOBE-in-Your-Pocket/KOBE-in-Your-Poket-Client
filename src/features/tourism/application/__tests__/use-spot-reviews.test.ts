import { mergeReviews } from '../use-spot-reviews';

import type { Review } from '../../domain/review';

function review(id: string, postedAt: string): Review {
  return {
    id,
    rating: { value: 5 },
    comment: id,
    author: { name: 'n', iconUrl: 'https://example.com/a.png' },
    postedAt,
    language: 'ja',
  };
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
});
