/**
 * 避難所の緯度経度。
 * 実 API 導入後もこの契約を共有する。
 */
export type ShelterCoordinates = {
  latitude: number;
  longitude: number;
};

/**
 * 避難所の区分。
 * 災害対策基本法上の「指定緊急避難場所」と「指定避難所」を区別する。
 * 両方を兼ねる施設は `both` で表す。
 */
export type ShelterType = 'emergency' | 'designated' | 'both';

/**
 * 避難所のドメインモデル。
 * 一覧・詳細の双方で共通利用できる最小フィールドを揃える。
 */
export type EvacuationShelter = {
  id: string;
  /** 施設名称（例: 神戸市役所）。 */
  name: string;
  /** 所在地住所。 */
  address: string;
  coordinates: ShelterCoordinates;
  /** 避難所の区分。 */
  type: ShelterType;
  /**
   * 収容可能人数。データが無い場合は `undefined`（UI 側で非表示）。
   */
  capacity?: number;
};
