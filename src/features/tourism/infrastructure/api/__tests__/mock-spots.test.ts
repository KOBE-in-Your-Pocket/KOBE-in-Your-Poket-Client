import { fetchSpots } from '../mock-spots';

describe('fetchSpots', () => {
  it('3〜5件の観光スポットを返す', async () => {
    const spots = await fetchSpots();

    expect(spots.length).toBeGreaterThanOrEqual(3);
    expect(spots.length).toBeLessThanOrEqual(5);
  });

  it('各スポットは一覧表示に必要なフィールドを持つ', async () => {
    const spots = await fetchSpots();

    for (const spot of spots) {
      expect(spot.id).toBeTruthy();
      expect(spot.name).toBeTruthy();
      expect(spot.genre).toBeTruthy();
      expect(spot.categoryLabel).toBeTruthy();
      expect(spot.description).toBeTruthy();
      expect(spot.imageUrl).toMatch(/^https?:\/\//);
      expect(spot.coordinates.latitude).toBeDefined();
      expect(spot.coordinates.longitude).toBeDefined();
      expect(spot.rating).toBeGreaterThan(0);
      expect(spot.businessHours).toBeTruthy();
    }
  });

  it('id は重複しない', async () => {
    const spots = await fetchSpots();

    const ids = spots.map((spot) => spot.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
