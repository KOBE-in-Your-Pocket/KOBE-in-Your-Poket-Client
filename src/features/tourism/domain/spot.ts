import type { SpotCategory } from './spot-category';
import type { SpotMedia } from './spot-media';
import type { SpotRating } from './spot-rating';

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
 * 観光スポットのコアドメインモデル。
 */
export type Spot = {
  id: string;
  name: string;
  genre: SpotGenre;
  description: string;
  coordinates: SpotCoordinates;
  businessHours: string;
  category: SpotCategory;
  media: SpotMedia;
  rating: SpotRating;
};
