/**
 * 観光スポットのジャンル区分。
 * 実 API 導入後もこの区分を契約として共有する。
 */
export type SpotGenre = 'landmark' | 'nature' | 'history' | 'gourmet' | 'onsen';

export type SpotCoordinates = {
  latitude: number;
  longitude: number;
};

/**
 * 観光スポットのドメインモデル。
 */
export type Spot = {
  id: string;
  name: string;
  genre: SpotGenre;
  /** UI 向けのカテゴリ表示名（例: 歴史地区）。 */
  categoryLabel: string;
  description: string;
  imageUrl: string;
  coordinates: SpotCoordinates;
  /** 5段階評価（例: 4.7）。 */
  rating: number;
  businessHours: string;
};
