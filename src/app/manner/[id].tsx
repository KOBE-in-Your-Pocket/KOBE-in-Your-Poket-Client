import { useLocalSearchParams } from 'expo-router';

import { MannerDetailScreen } from '@/features/manner';
import { useSpots } from '@/features/tourism';

/**
 * マナー項目詳細の動的ルート（`/manner/[id]`）。
 *
 * app 層はルーティングと feature 間の配線のみを担う。URL の `id` を取り出して
 * {@link MannerDetailScreen} へ委譲し、関連スポット表示用のスポットデータ（tourism）は
 * ここ（composition 層）で取得して渡す。データ取得・表示ロジックは持たない。
 */
export default function MannerDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: spots } = useSpots();

  return <MannerDetailScreen mannerId={id} spots={spots} />;
}
