import type { EvacuationShelter } from '../../domain/evacuation-shelter';

/** mock fetcher が模すネットワーク遅延（ミリ秒）。 */
const MOCK_LATENCY_MS = 300;

/** mock の避難所一覧（神戸市内の代表的な公共施設・公園）。 */
const MOCK_SHELTERS: EvacuationShelter[] = [
  {
    id: 'higashi-yuenchi',
    name: '東遊園地',
    address: '兵庫県神戸市中央区加納町6丁目4',
    coordinates: { latitude: 34.6905, longitude: 135.1958 },
    type: 'emergency',
    capacity: 8000,
  },
  {
    id: 'minato-no-mori-park',
    name: 'みなとのもり公園',
    address: '兵庫県神戸市中央区脇浜海岸通1丁目',
    coordinates: { latitude: 34.682, longitude: 135.1928 },
    type: 'emergency',
    capacity: 6000,
  },
  {
    id: 'oji-park',
    name: '王子公園',
    address: '兵庫県神戸市灘区王子町3丁目1',
    coordinates: { latitude: 34.7126, longitude: 135.2125 },
    type: 'both',
    capacity: 5000,
  },
  {
    id: 'kobe-central-gymnasium',
    name: '神戸市立中央体育館',
    address: '兵庫県神戸市中央区楠町4丁目1-1',
    coordinates: { latitude: 34.6841, longitude: 135.1772 },
    type: 'designated',
    capacity: 1200,
  },
  {
    id: 'minatogawa-park',
    name: '湊川公園',
    address: '兵庫県神戸市兵庫区荒田町1丁目',
    coordinates: { latitude: 34.679, longitude: 135.1668 },
    type: 'both',
    capacity: 3000,
  },
  {
    id: 'wakamatsu-park',
    name: '若松公園',
    address: '兵庫県神戸市長田区若松町6丁目',
    coordinates: { latitude: 34.673, longitude: 135.162 },
    type: 'emergency',
  },
];

function cloneShelter(shelter: EvacuationShelter): EvacuationShelter {
  return { ...shelter, coordinates: { ...shelter.coordinates } };
}

/**
 * 避難所一覧を取得する。
 * 実 API / ローカル DB 導入後もこのシグネチャを維持し、application / ui 層を変更せずに差し替える。
 */
export async function fetchEvacuationShelters(): Promise<EvacuationShelter[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  return MOCK_SHELTERS.map(cloneShelter);
}
