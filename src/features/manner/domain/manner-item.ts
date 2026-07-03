/**
 * マナー項目の分類。
 * 守るべき「マナー」か、法令・条例上の「決まり（ルール）」か。
 * 一覧のフィルタキーとしても利用する。
 */
export type MannerKind = 'manner' | 'rule';

/**
 * マナー項目の適用地域。
 * 神戸ローカル固有か、日本全国で共通か。
 * 一覧のフィルタキーとしても利用する。
 */
export type MannerScope = 'kobe' | 'japan';

/**
 * マナー項目のドメインモデル。
 * 一覧表示・フィルタ・観光名所連携で共通利用する最小フィールドを揃える。
 */
export type MannerItem = {
  id: string;
  /** 一覧・詳細で表示するタイトル。 */
  title: string;
  /** 一覧カード等で表示する短い説明。 */
  description: string;
  /** アイコン識別キー（アイコンコンポーネントへのマッピング用）。 */
  icon: string;
  /** 分類（manner | rule）。フィルタのキーにもなる。 */
  kind: MannerKind;
  /** 適用地域（kobe | japan）。フィルタのキーにもなる。 */
  scope: MannerScope;
  /**
   * 関連する観光スポットの ID 一覧（tourism ドメインの `Spot.id` を参照）。
   * 観光名所連携で、スポット詳細に紐づくマナーを引くために使う。
   * 関連が無い場合は空配列。
   */
  relatedSpotIds: string[];
};
