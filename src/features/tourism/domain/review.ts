/**
 * 観光スポットに投稿されたユーザーレビュー。
 */
export type Review = {
  /** 星評価（1〜5）。 */
  rating: number;
  /** コメント本文。 */
  comment: string;
  /** 投稿者名。 */
  authorName: string;
  /** 投稿者アイコンの画像 URL。 */
  authorIconUrl: string;
  /** 投稿日時（ISO 8601 形式の文字列）。 */
  postedAt: string;
};
