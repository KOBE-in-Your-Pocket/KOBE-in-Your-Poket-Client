/**
 * 公開プロフィールとして他者に見えるユーザー情報。
 * レビュー投稿者など、feature 境界をまたいで参照される。
 */
export type PublicUser = {
  /** 表示名。 */
  name: string;
  /** アイコンの画像 URL。 */
  iconUrl: string;
};
