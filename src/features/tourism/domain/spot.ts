/**
 * 観光スポットのジャンル区分。
 * 実 API 導入後もこの区分を契約として共有する。
 */
export type SpotGenre = 'landmark' | 'nature' | 'history' | 'gourmet' | 'onsen';

/**
 * 観光スポットのドメインモデル。
 *
 * domain 層は何にも依存しない純粋な型として定義し、
 * infrastructure（mock / 実 API）と ui の双方がこの型を契約として共有する。
 */
export type Spot = {
  /** 一意な識別子。 */
  id: string;
  /** スポット名。 */
  name: string;
  /** ジャンル区分。 */
  genre: SpotGenre;
  /** 概要説明。 */
  description: string;
};
