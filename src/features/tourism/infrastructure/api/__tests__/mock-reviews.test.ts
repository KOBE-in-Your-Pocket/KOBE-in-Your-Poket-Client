import { SUPPORTED_LANGUAGES } from '@/shared/lib/i18n';

import { fetchReviews } from '../mock-reviews';
import { fetchSpots } from '../mock-spots';

describe('fetchReviews', () => {
  it('指定スポットのレビューを返す', async () => {
    const reviews = await fetchReviews('kobe-port-tower', 'ja');

    expect(reviews.length).toBeGreaterThan(0);
  });

  it('一覧の全スポットがレビューを持つ', async () => {
    const spots = await fetchSpots('ja');

    for (const spot of spots) {
      const reviews = await fetchReviews(spot.id, 'ja');
      expect(reviews.length).toBeGreaterThan(0);
    }
  });

  it('レビュー件数は言語に依存しない', async () => {
    const counts = await Promise.all(
      SUPPORTED_LANGUAGES.map(async (language) => {
        const reviews = await fetchReviews('kobe-port-tower', language);
        return reviews.length;
      }),
    );

    expect(new Set(counts).size).toBe(1);
  });

  it('全対応言語で文言が欠落しない', async () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const reviews = await fetchReviews('kobe-port-tower', language);

      for (const review of reviews) {
        expect(review.comment).toBeTruthy();
        expect(review.author.name).toBeTruthy();
      }
    }
  });

  it('言語未指定ではフォールバック言語（en）の文言を返す', async () => {
    const defaultReviews = await fetchReviews('kobe-port-tower');
    const enReviews = await fetchReviews('kobe-port-tower', 'en');

    expect(defaultReviews.map((review) => review.author.name)).toEqual(
      enReviews.map((review) => review.author.name),
    );
  });

  it('呼び出しごとに独立したオブジェクトを返す', async () => {
    const first = await fetchReviews('kobe-port-tower', 'ja');
    const second = await fetchReviews('kobe-port-tower', 'ja');

    expect(first[0]).not.toBe(second[0]);

    first[0].author.name = 'mutated';
    expect(second[0]?.author.name).not.toBe('mutated');
  });

  it('各レビューは表示に必要なフィールドを持つ', async () => {
    const reviews = await fetchReviews('nankinmachi', 'ja');

    for (const review of reviews) {
      expect(review.rating.value).toBeGreaterThanOrEqual(1);
      expect(review.rating.value).toBeLessThanOrEqual(5);
      expect(review.comment).toBeTruthy();
      expect(review.author.name).toBeTruthy();
      expect(review.author.iconUrl).toMatch(/^https?:\/\//);
      expect(Number.isNaN(Date.parse(review.postedAt))).toBe(false);
    }
  });

  it('指定した言語の文言を返す', async () => {
    const jaReviews = await fetchReviews('kobe-port-tower', 'ja');
    const enReviews = await fetchReviews('kobe-port-tower', 'en');

    expect(jaReviews[0]?.author.name).toBe('山田 健太');
    expect(enReviews[0]?.author.name).toBe('Kenta Yamada');
  });

  it('未知のスポット ID には空配列を返す', async () => {
    const reviews = await fetchReviews('unknown-spot', 'ja');

    expect(reviews).toEqual([]);
  });
});
