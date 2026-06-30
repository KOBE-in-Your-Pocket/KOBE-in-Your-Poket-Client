export type ShelterCoordinates = {
  latitude: number;
  longitude: number;
};

/** 災害対策基本法上の区分（指定緊急避難場所 / 指定避難所 / 兼用）。 */
export type ShelterType = 'emergency' | 'designated' | 'both';

/** 避難所のドメインモデル。一覧・詳細で共通利用する最小フィールド。 */
export type EvacuationShelter = {
  id: string;
  name: string;
  address: string;
  coordinates: ShelterCoordinates;
  type: ShelterType;
  /** 収容可能人数。無い場合は undefined。 */
  capacity?: number;
};
