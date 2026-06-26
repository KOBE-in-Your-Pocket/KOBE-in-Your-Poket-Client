import { fetchReviews } from '../mock-reviews';

describe('fetchReviews', () => {
  it('指定スポットのレビューを返す', async () => {
    const reviews = await fetchReviews('kobe-port-tower', 'ja');

    expect(reviews.length).toBeGreaterThan(0);
  });

  it('各レビューは表示に必要なフィールドを持つ', async () => {
    const reviews = await fetchReviews('nankinmachi', 'ja');

    for (const review of reviews) {
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.comment).toBeTruthy();
      expect(review.authorName).toBeTruthy();
      expect(review.authorIconUrl).toMatch(/^https?:\/\//);
      expect(Number.isNaN(Date.parse(review.postedAt))).toBe(false);
    }
  });

  it('指定した言語の文言を返す', async () => {
    const jaReviews = await fetchReviews('kobe-port-tower', 'ja');
    const enReviews = await fetchReviews('kobe-port-tower', 'en');

    expect(jaReviews[0]?.authorName).toBe('山田 健太');
    expect(enReviews[0]?.authorName).toBe('Kenta Yamada');
  });

  it('未知のスポット ID には空配列を返す', async () => {
    const reviews = await fetchReviews('unknown-spot', 'ja');

    expect(reviews).toEqual([]);
  });
});
