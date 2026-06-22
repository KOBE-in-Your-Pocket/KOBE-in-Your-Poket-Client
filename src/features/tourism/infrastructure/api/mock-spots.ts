import type { Spot } from '../../domain';

/**
 * mock の観光スポット一覧（神戸の代表的な名所）。
 * Sprint 2 で実 API に差し替える前提のサンプルデータ。
 */
const MOCK_SPOTS: Spot[] = [
  {
    id: 'kobe-port-tower',
    name: '神戸ポートタワー',
    genre: 'landmark',
    description: '神戸港のシンボル。鼓を思わせる赤い鉄塔で、展望フロアから街と海を一望できる。',
  },
  {
    id: 'kitano-ijinkan',
    name: '北野異人館街',
    genre: 'history',
    description:
      '開港期に外国人が暮らした洋館が立ち並ぶ地区。風見鶏の館をはじめ異国情緒あふれる街並みが残る。',
  },
  {
    id: 'nankinmachi',
    name: '南京町',
    genre: 'gourmet',
    description: '西日本有数の中華街。豚まんや点心など食べ歩きグルメでにぎわう。',
  },
  {
    id: 'arima-onsen',
    name: '有馬温泉',
    genre: 'onsen',
    description: '日本三古湯のひとつ。鉄分を含む茶褐色の「金泉」と無色透明の「銀泉」で知られる。',
  },
  {
    id: 'mount-rokko',
    name: '六甲山',
    genre: 'nature',
    description:
      '神戸の街を見下ろす山。ハイキングや植物園が楽しめ、山上から望む夜景は日本三大夜景に数えられる。',
  },
];

/** mock fetcher が模すネットワーク遅延（ミリ秒）。 */
const MOCK_LATENCY_MS = 300;

/**
 * 観光スポット一覧を取得する。
 *
 * 現状は mock データを返すが、Sprint 2 で実 REST API 呼び出しに差し替える。
 * その際もこの `fetchSpots(): Promise<Spot[]>` というシグネチャを維持することで、
 * application / ui 層を変更せずに実装だけを入れ替えられる。
 */
export async function fetchSpots(): Promise<Spot[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  // 呼び出し側が内部の mock を変更できないよう、毎回新しい配列・オブジェクトを返す。
  return MOCK_SPOTS.map((spot) => ({ ...spot }));
}
