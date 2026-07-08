import { MannerScreen } from '@/features/manner';
import { useSpots } from '@/features/tourism';

/** manner 機能が tourism 機能に依存しないよう、スポットデータはここ（app 層）で取得して渡す。 */
export default function MannersRoute() {
  const { data: spots } = useSpots();

  return <MannerScreen spots={spots} />;
}
