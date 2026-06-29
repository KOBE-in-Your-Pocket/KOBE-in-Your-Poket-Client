import { SUPPORTED_LANGUAGES } from '@/shared/lib/i18n';

import { fetchReviews, postReview, resetMockReviews, updateReview } from '../mock-reviews';
import { fetchSpots } from '../mock-spots';

beforeEach(() => {
  resetMockReviews();
});

// ─── fetchReviews（シードデータ + 言語） ────────────────────────────────────

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

  it('レビュー件数は表示言語に依存しない', async () => {
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

  it('表示言語未指定ではフォールバック言語（en）の文言を返す', async () => {
    const defaultReviews = await fetchReviews('kobe-port-tower');
    const enReviews = await fetchReviews('kobe-port-tower', 'en');

    expect(defaultReviews.map((r) => r.author.name)).toEqual(enReviews.map((r) => r.author.name));
  });

  it('呼び出しごとに独立したオブジェクトを返す', async () => {
    const first = await fetchReviews('kobe-port-tower', 'ja');
    const second = await fetchReviews('kobe-port-tower', 'ja');

    expect(first[0]).not.toBe(second[0]);

    first[0]!.author.name = 'mutated';
    expect(second[0]?.author.name).not.toBe('mutated');
  });

  it('各レビューは表示に必要なフィールドを持つ', async () => {
    const reviews = await fetchReviews('nankinmachi', 'ja');

    for (const review of reviews) {
      expect(review.id).toBeTruthy();
      expect(review.spotId).toBe('nankinmachi');
      expect(review.rating.value).toBeGreaterThanOrEqual(1);
      expect(review.rating.value).toBeLessThanOrEqual(5);
      expect(review.comment).toBeTruthy();
      expect(review.author.name).toBeTruthy();
      expect(review.author.iconUrl).toMatch(/^https?:\/\//);
      expect(Number.isNaN(Date.parse(review.postedAt))).toBe(false);
      expect(review.language).toBeTruthy();
    }
  });

  it('指定した表示言語の文言を返す', async () => {
    const jaReviews = await fetchReviews('kobe-port-tower', 'ja');
    const enReviews = await fetchReviews('kobe-port-tower', 'en');

    expect(jaReviews[0]?.author.name).toBe('山田 健太');
    expect(enReviews[0]?.author.name).toBe('Kenta Yamada');
  });

  it('未知のスポット ID には空配列を返す', async () => {
    const reviews = await fetchReviews('unknown-spot', 'ja');

    expect(reviews).toEqual([]);
  });

  // ─── filterLang（言語別絞り込み） ───────────────────────────────────────

  it('filterLang 指定でその言語のレビューのみ返す', async () => {
    const reviews = await fetchReviews('kobe-port-tower', 'en', 'ja');

    expect(reviews.length).toBeGreaterThan(0);
    for (const r of reviews) {
      expect(r.language).toBe('ja');
    }
  });

  it('filterLang 未指定では全言語を返す', async () => {
    const reviews = await fetchReviews('kobe-port-tower', 'en');
    const languages = new Set(reviews.map((r) => r.language));

    expect(languages.size).toBeGreaterThanOrEqual(1);
  });
});

// ─── postReview ──────────────────────────────────────────────────────────────

describe('postReview', () => {
  it('新しいレビューを作成して返す', async () => {
    const review = await postReview('kobe-port-tower', {
      rating: 4,
      comment: 'Great place!',
      authorName: 'TestUser',
      language: 'en',
    });

    expect(review.spotId).toBe('kobe-port-tower');
    expect(review.rating.value).toBe(4);
    expect(review.comment).toBe('Great place!');
    expect(review.author.name).toBe('TestUser');
    expect(review.language).toBe('en');
    expect(review.id).toBeTruthy();
    expect(Number.isNaN(Date.parse(review.postedAt))).toBe(false);
  });

  it('投稿後に fetchReviews で取得できる', async () => {
    await postReview('mount-rokko', {
      rating: 5,
      comment: '素晴らしい眺め！',
      authorName: 'Hanako',
      language: 'ja',
    });

    const reviews = await fetchReviews('mount-rokko');
    expect(reviews.some((r) => r.comment === '素晴らしい眺め！')).toBe(true);
  });

  it('連続投稿の id は重複しない', async () => {
    const [r1, r2] = await Promise.all([
      postReview('kobe-port-tower', { rating: 3, comment: 'OK', authorName: 'A', language: 'en' }),
      postReview('nankinmachi', { rating: 4, comment: 'Good', authorName: 'B', language: 'en' }),
    ]);

    expect(r1.id).not.toBe(r2.id);
  });

  it('投稿したレビューは filterLang で絞り込める', async () => {
    await postReview('kobe-port-tower', {
      rating: 5,
      comment: 'Superb!',
      authorName: 'Tom',
      language: 'en',
    });

    const enReviews = await fetchReviews('kobe-port-tower', 'en', 'en');
    expect(enReviews.some((r) => r.comment === 'Superb!')).toBe(true);

    const koReviews = await fetchReviews('kobe-port-tower', 'en', 'ko');
    expect(koReviews.some((r) => r.comment === 'Superb!')).toBe(false);
  });
});

// ─── updateReview ─────────────────────────────────────────────────────────────

describe('updateReview', () => {
  it('投稿したレビューの rating と comment を更新できる', async () => {
    const posted = await postReview('kobe-port-tower', {
      rating: 4,
      comment: 'Good!',
      authorName: 'TestUser',
      language: 'en',
    });

    const updated = await updateReview('kobe-port-tower', posted.id, {
      rating: 2,
      comment: 'Changed my mind.',
    });

    expect(updated.id).toBe(posted.id);
    expect(updated.rating.value).toBe(2);
    expect(updated.comment).toBe('Changed my mind.');
    expect(updated.author.name).toBe('TestUser');
  });

  it('部分更新できる（rating のみ）', async () => {
    const posted = await postReview('kobe-port-tower', {
      rating: 4,
      comment: 'Original comment.',
      authorName: 'TestUser',
      language: 'en',
    });

    const updated = await updateReview('kobe-port-tower', posted.id, { rating: 1 });

    expect(updated.rating.value).toBe(1);
    expect(updated.comment).toBe('Original comment.');
  });

  it('存在しない reviewId はエラーをスローする', async () => {
    await expect(
      updateReview('kobe-port-tower', 'nonexistent-id', { rating: 3 }),
    ).rejects.toThrow();
  });

  it('別スポットの reviewId はエラーをスローする', async () => {
    const posted = await postReview('kobe-port-tower', {
      rating: 4,
      comment: 'Hello',
      authorName: 'TestUser',
      language: 'en',
    });

    await expect(updateReview('nankinmachi', posted.id, { rating: 3 })).rejects.toThrow();
  });

  it('更新後に fetchReviews で反映を確認できる', async () => {
    const posted = await postReview('kobe-port-tower', {
      rating: 4,
      comment: 'Before',
      authorName: 'TestUser',
      language: 'en',
    });

    await updateReview('kobe-port-tower', posted.id, { comment: 'Updated!' });

    const reviews = await fetchReviews('kobe-port-tower');
    expect(reviews.find((r) => r.id === posted.id)?.comment).toBe('Updated!');
  });

  it('シードレビューは更新できない', async () => {
    const seedReviews = await fetchReviews('kobe-port-tower', 'ja');
    const seedId = seedReviews[0]!.id;

    await expect(updateReview('kobe-port-tower', seedId, { rating: 1 })).rejects.toThrow();
  });
});
