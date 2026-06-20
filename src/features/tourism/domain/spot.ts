/**
 * 観光スポットのジャンル区分。
 * 実 API 導入後もこの区分を契約として共有する。
 */
export type SpotGenre = 'landmark' | 'nature' | 'history' | 'gourmet' | 'onsen';

/**
 * 観光スポットのドメインモデル。
 */
export type Spot = {
  id: string;
  name: string;
  genre: SpotGenre;
  description: string;
};
