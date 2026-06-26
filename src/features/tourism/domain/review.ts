import type { PublicUser } from '@/features/user';

import type { SpotRating } from './spot-rating';

/**
 * 観光スポットに投稿されたユーザーレビュー。
 */
export type Review = {
  /** 星評価（1〜5）。 */
  rating: SpotRating;
  /** コメント本文。 */
  comment: string;
  /** 投稿者の公開プロフィール。 */
  author: PublicUser;
  /** 投稿日時（ISO 8601 形式の文字列）。 */
  postedAt: string;
};
