import { buildDirectionsUrl, type DirectionsCoordinate } from '../open-directions';

const destination: DirectionsCoordinate = { latitude: 34.6826, longitude: 135.1863 };
const origin: DirectionsCoordinate = { latitude: 34.694722, longitude: 135.195833 };

describe('buildDirectionsUrl', () => {
  describe('iOS（Apple マップ）', () => {
    it('出発地ありで saddr / daddr / 徒歩(dirflg=w) を含む', () => {
      const url = buildDirectionsUrl(destination, { origin, mode: 'walking', platformOs: 'ios' });

      expect(url).toBe(
        'http://maps.apple.com/?saddr=34.694722,135.195833&daddr=34.6826,135.1863&dirflg=w',
      );
    });

    it('出発地なしなら saddr を含めず現在地に任せる', () => {
      const url = buildDirectionsUrl(destination, { platformOs: 'ios' });

      expect(url).toBe('http://maps.apple.com/?daddr=34.6826,135.1863&dirflg=w');
    });

    it('移動手段に応じて dirflg が変わる', () => {
      expect(buildDirectionsUrl(destination, { mode: 'driving', platformOs: 'ios' })).toContain(
        'dirflg=d',
      );
      expect(buildDirectionsUrl(destination, { mode: 'transit', platformOs: 'ios' })).toContain(
        'dirflg=r',
      );
    });
  });

  describe('Android / Web（Google マップ）', () => {
    it('出発地ありで origin / destination / travelmode を含む', () => {
      const url = buildDirectionsUrl(destination, {
        origin,
        mode: 'walking',
        platformOs: 'android',
      });

      expect(url).toBe(
        'https://www.google.com/maps/dir/?api=1&destination=34.6826,135.1863&travelmode=walking&origin=34.694722,135.195833',
      );
    });

    it('出発地なしなら origin を含めない', () => {
      const url = buildDirectionsUrl(destination, { platformOs: 'web' });

      expect(url).toBe(
        'https://www.google.com/maps/dir/?api=1&destination=34.6826,135.1863&travelmode=walking',
      );
    });
  });

  it('mode 未指定なら徒歩がデフォルト', () => {
    expect(buildDirectionsUrl(destination, { platformOs: 'ios' })).toContain('dirflg=w');
    expect(buildDirectionsUrl(destination, { platformOs: 'android' })).toContain(
      'travelmode=walking',
    );
  });
});
