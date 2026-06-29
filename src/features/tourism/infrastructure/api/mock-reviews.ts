import { FALLBACK_LANGUAGE, type SupportedLanguage } from '@/shared/lib/i18n';

import type { Review, CreateReviewInput, UpdateReviewInput } from '../../domain/review';

import type { MockSpotId } from './mock-spot-localizations';
import {
  MOCK_REVIEW_LOCALIZATIONS,
  type MockReviewId,
  type ReviewLocalization,
} from './mock-review-localizations';

type MockReviewBase = {
  id: MockReviewId;
  spotId: MockSpotId;
  /** 星評価（1〜5）。 */
  rating: number;
  /** 投稿者アイコンの画像 URL。 */
  authorIconUrl: string;
  /** 投稿日時（ISO 8601 形式の文字列）。 */
  postedAt: string;
  /** レビューが書かれた言語。 */
  language: SupportedLanguage;
};

/**
 * スポットごとの mock レビュー（言語非依存の項目）。
 * 言語依存の文言は {@link MOCK_REVIEW_LOCALIZATIONS} で管理する。
 */
const MOCK_REVIEWS_BY_SPOT: Record<MockSpotId, MockReviewBase[]> = {
  'kobe-port-tower': [
    {
      id: 'kobe-port-tower-1',
      spotId: 'kobe-port-tower',
      rating: 5,
      authorIconUrl: 'https://i.pravatar.cc/150?img=12',
      postedAt: '2025-11-03T10:24:00.000Z',
      language: 'ja',
    },
    {
      id: 'kobe-port-tower-2',
      spotId: 'kobe-port-tower',
      rating: 4,
      authorIconUrl: 'https://i.pravatar.cc/150?img=45',
      postedAt: '2025-10-18T07:50:00.000Z',
      language: 'en',
    },
  ],
  'kitano-ijinkan': [
    {
      id: 'kitano-ijinkan-1',
      spotId: 'kitano-ijinkan',
      rating: 4,
      authorIconUrl: 'https://i.pravatar.cc/150?img=33',
      postedAt: '2025-09-27T05:10:00.000Z',
      language: 'ja',
    },
    {
      id: 'kitano-ijinkan-2',
      spotId: 'kitano-ijinkan',
      rating: 5,
      authorIconUrl: 'https://i.pravatar.cc/150?img=23',
      postedAt: '2025-08-14T02:35:00.000Z',
      language: 'en',
    },
  ],
  nankinmachi: [
    {
      id: 'nankinmachi-1',
      spotId: 'nankinmachi',
      rating: 5,
      authorIconUrl: 'https://i.pravatar.cc/150?img=7',
      postedAt: '2025-12-01T11:05:00.000Z',
      language: 'ja',
    },
    {
      id: 'nankinmachi-2',
      spotId: 'nankinmachi',
      rating: 3,
      authorIconUrl: 'https://i.pravatar.cc/150?img=49',
      postedAt: '2025-11-22T08:42:00.000Z',
      language: 'en',
    },
  ],
  'arima-onsen': [
    {
      id: 'arima-onsen-1',
      spotId: 'arima-onsen',
      rating: 5,
      authorIconUrl: 'https://i.pravatar.cc/150?img=15',
      postedAt: '2025-10-09T13:18:00.000Z',
      language: 'ja',
    },
    {
      id: 'arima-onsen-2',
      spotId: 'arima-onsen',
      rating: 4,
      authorIconUrl: 'https://i.pravatar.cc/150?img=27',
      postedAt: '2025-07-30T06:00:00.000Z',
      language: 'en',
    },
  ],
  'mount-rokko': [
    {
      id: 'mount-rokko-1',
      spotId: 'mount-rokko',
      rating: 5,
      authorIconUrl: 'https://i.pravatar.cc/150?img=51',
      postedAt: '2025-11-15T09:33:00.000Z',
      language: 'ja',
    },
    {
      id: 'mount-rokko-2',
      spotId: 'mount-rokko',
      rating: 4,
      authorIconUrl: 'https://i.pravatar.cc/150?img=60',
      postedAt: '2025-09-02T04:21:00.000Z',
      language: 'en',
    },
  ],
};

/** mock fetcher が模すネットワーク遅延（ミリ秒）。 */
const MOCK_LATENCY_MS = 300;

function isMockSpotId(spotId: string): spotId is MockSpotId {
  return spotId in MOCK_REVIEWS_BY_SPOT;
}

function resolveLocalization(
  language: SupportedLanguage,
  reviewId: MockReviewId,
): ReviewLocalization {
  return (
    MOCK_REVIEW_LOCALIZATIONS[language]?.[reviewId] ??
    MOCK_REVIEW_LOCALIZATIONS[FALLBACK_LANGUAGE][reviewId]
  );
}

function buildSeedReview(base: MockReviewBase, language: SupportedLanguage): Review {
  const localized = resolveLocalization(language, base.id);

  return {
    id: base.id,
    spotId: base.spotId,
    rating: { value: base.rating },
    comment: localized.comment,
    author: {
      name: localized.authorName,
      iconUrl: base.authorIconUrl,
    },
    postedAt: base.postedAt,
    language: base.language,
  };
}

/** ユーザーが投稿したレビューの可変ストア（テスト間リセット対象）。 */
let userPostedReviews: Review[] = [];
let nextIdCounter = 1;

/** テスト間の分離のためにユーザー投稿ストアをリセットする。 */
export function resetMockReviews(): void {
  userPostedReviews = [];
  nextIdCounter = 1;
}

/**
 * 指定スポットに投稿されたレビュー一覧を取得する。
 *
 * - `language`: 表示言語（シードデータの著者名・コメントのローカライズに使用）。
 * - `filterLang`: 絞り込み言語（`?lang=ja` 相当。指定すると書かれた言語でフィルタリング）。
 *
 * 現状は mock データを返すが、実 API 導入後も `fetchReviews(spotId, language, filterLang)` シグネチャを維持する。
 * 未知のスポット ID には空配列を返す。
 */
export async function fetchReviews(
  spotId: string,
  language: SupportedLanguage = FALLBACK_LANGUAGE,
  filterLang?: SupportedLanguage,
): Promise<Review[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  const seedReviews: Review[] = isMockSpotId(spotId)
    ? MOCK_REVIEWS_BY_SPOT[spotId].map((base) => buildSeedReview(base, language))
    : [];

  const postedForSpot = userPostedReviews.filter((r) => r.spotId === spotId).map((r) => ({ ...r }));

  const all = [...seedReviews, ...postedForSpot];

  return filterLang ? all.filter((r) => r.language === filterLang) : all;
}

/**
 * 指定スポットへレビューを投稿する。
 *
 * `authorName` はリクエスト引数で受け取る薄い seam。本認証は User PBI で実装予定。
 */
export async function postReview(spotId: string, input: CreateReviewInput): Promise<Review> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  const review: Review = {
    id: `user-${String(nextIdCounter++).padStart(3, '0')}`,
    spotId,
    rating: { value: input.rating },
    comment: input.comment,
    author: { name: input.authorName, iconUrl: '' },
    postedAt: new Date().toISOString(),
    language: input.language,
  };

  userPostedReviews = [...userPostedReviews, review];
  return { ...review };
}

/**
 * ユーザーが投稿したレビューを更新する。
 *
 * シードデータは変更不可。`spotId` と `reviewId` が一致するユーザー投稿レビューが
 * 存在しない場合はエラーをスローする。
 */
export async function updateReview(
  spotId: string,
  reviewId: string,
  input: UpdateReviewInput,
): Promise<Review> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  const index = userPostedReviews.findIndex((r) => r.spotId === spotId && r.id === reviewId);

  if (index === -1) {
    throw new Error(`Review ${reviewId} not found for spot ${spotId}`);
  }

  const prev = userPostedReviews[index]!;
  const updated: Review = {
    ...prev,
    ...(input.rating !== undefined ? { rating: { value: input.rating } } : {}),
    ...(input.comment !== undefined ? { comment: input.comment } : {}),
  };

  userPostedReviews = [
    ...userPostedReviews.slice(0, index),
    updated,
    ...userPostedReviews.slice(index + 1),
  ];

  return { ...updated };
}
