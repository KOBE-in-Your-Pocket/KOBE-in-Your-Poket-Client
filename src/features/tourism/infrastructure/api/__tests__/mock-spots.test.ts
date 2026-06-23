import { fetchSpots } from '../mock-spots';

describe('fetchSpots', () => {
  it('3〜5件の観光スポットを返す', async () => {
    const spots = await fetchSpots('ja');

    expect(spots.length).toBeGreaterThanOrEqual(3);
    expect(spots.length).toBeLessThanOrEqual(5);
  });

  it('各スポットは一覧表示に必要なフィールドを持つ', async () => {
    const spots = await fetchSpots('ja');

    for (const spot of spots) {
      expect(spot.id).toBeTruthy();
      expect(spot.name).toBeTruthy();
      expect(spot.genre).toBeTruthy();
      expect(spot.category.label).toBeTruthy();
      expect(spot.description).toBeTruthy();
      expect(spot.media.imageUrl).toMatch(/^https?:\/\//);
      expect(spot.coordinates.latitude).toBeDefined();
      expect(spot.coordinates.longitude).toBeDefined();
      expect(spot.rating.value).toBeGreaterThan(0);
      expect(spot.businessHours).toBeTruthy();
    }
  });

  it('id は重複しない', async () => {
    const spots = await fetchSpots('ja');

    const ids = spots.map((spot) => spot.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('指定した言語の名称を返す', async () => {
    const jaSpots = await fetchSpots('ja');
    const enSpots = await fetchSpots('en');

    expect(jaSpots.find((spot) => spot.id === 'kobe-port-tower')?.name).toBe('神戸ポートタワー');
    expect(enSpots.find((spot) => spot.id === 'kobe-port-tower')?.name).toBe('Kobe Port Tower');
  });
});
