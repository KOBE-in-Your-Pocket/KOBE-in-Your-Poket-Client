import type { SupportedLanguage } from '@/shared/lib/i18n';
import type { PublicUser } from '@/features/user';

import type { SpotRating } from './spot-rating';

/** 星評価の数値リテラル（投稿・更新フォームの入力型として使用）。 */
export type ReviewRating = 1 | 2 | 3 | 4 | 5;

/**
 * 観光スポットに投稿されたユーザーレビュー。
 */
export type Review = {
  /** サーバー発行の一意識別子。 */
  id: string;
  /** 対象スポットの ID。 */
  spotId: string;
  /** 星評価（1〜5）。 */
  rating: SpotRating;
  /** コメント本文。 */
  comment: string;
  /** 投稿者の公開プロフィール。 */
  author: PublicUser;
  /** 投稿日時（ISO 8601 形式の文字列）。 */
  postedAt: string;
  /** レビューが書かれた言語。言語別フィルタリングに使用。 */
  language: SupportedLanguage;
};

/**
 * レビュー投稿リクエストのペイロード。
 * `authorName` は認証未確定のため引数で受ける薄い seam（本実装は User PBI で）。
 */
export type CreateReviewInput = {
  rating: ReviewRating;
  comment: string;
  authorName: string;
  language: SupportedLanguage;
};

/** レビュー更新リクエストのペイロード。未指定フィールドは変更しない。 */
export type UpdateReviewInput = {
  rating?: ReviewRating;
  comment?: string;
};
