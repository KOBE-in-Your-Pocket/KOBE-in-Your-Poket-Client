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
    category: { label: 'ウォーターフロント' },
    description: '神戸港のシンボル。鼓を思わせる赤い鉄塔で、展望フロアから街と海を一望できる。',
    media: {
      imageUrl:
        'https://images.unsplash.com/photo-1570091160392-39f6a6596f46?auto=format&fit=crop&w=800&q=80',
    },
    coordinates: { latitude: 34.6826, longitude: 135.1863 },
    rating: { value: 4.5 },
    businessHours: '9:00 – 21:00',
  },
  {
    id: 'kitano-ijinkan',
    name: '北野異人館街',
    genre: 'history',
    category: { label: '歴史地区' },
    description:
      '開港期に外国人が暮らした洋館が立ち並ぶ地区。風見鶏の館をはじめ異国情緒あふれる街並みが残る。',
    media: {
      imageUrl:
        'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    },
    coordinates: { latitude: 34.6989, longitude: 135.1896 },
    rating: { value: 4.7 },
    businessHours: '9:00 – 18:00',
  },
  {
    id: 'nankinmachi',
    name: '南京町',
    genre: 'gourmet',
    category: { label: '中華街' },
    description: '西日本有数の中華街。豚まんや点心など食べ歩きグルメでにぎわう。',
    media: {
      imageUrl:
        'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80',
    },
    coordinates: { latitude: 34.6889, longitude: 135.1877 },
    rating: { value: 4.4 },
    businessHours: '10:00 – 20:00',
  },
  {
    id: 'arima-onsen',
    name: '有馬温泉',
    genre: 'onsen',
    category: { label: '温泉' },
    description: '日本三古湯のひとつ。鉄分を含む茶褐色の「金泉」と無色透明の「銀泉」で知られる。',
    media: {
      imageUrl:
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    },
    coordinates: { latitude: 34.7956, longitude: 135.2468 },
    rating: { value: 4.8 },
    businessHours: 'Open 24 hours',
  },
  {
    id: 'mount-rokko',
    name: '六甲山',
    genre: 'nature',
    category: { label: '自然' },
    description:
      '神戸の街を見下ろす山。ハイキングや植物園が楽しめ、山上から望む夜景は日本三大夜景に数えられる。',
    media: {
      imageUrl:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
    },
    coordinates: { latitude: 34.7488, longitude: 135.2231 },
    rating: { value: 4.6 },
    businessHours: '9:00 – 17:00',
  },
];

/** mock fetcher が模すネットワーク遅延（ミリ秒）。 */
const MOCK_LATENCY_MS = 300;

function cloneSpot(spot: Spot): Spot {
  return {
    ...spot,
    coordinates: { ...spot.coordinates },
    category: { ...spot.category },
    media: { ...spot.media },
    rating: { ...spot.rating },
  };
}

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
  return MOCK_SPOTS.map(cloneSpot);
}
