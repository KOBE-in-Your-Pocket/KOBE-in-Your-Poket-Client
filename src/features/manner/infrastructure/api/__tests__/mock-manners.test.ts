import { SUPPORTED_LANGUAGES } from '@/shared/lib/i18n';

import { fetchMannerById, fetchManners } from '../mock-manners';

describe('fetchManners', () => {
  it('5件以上のマナー項目を返す', async () => {
    const manners = await fetchManners('ja');

    expect(manners.length).toBeGreaterThanOrEqual(5);
  });

  it('各項目は一覧表示・フィルタに必要なフィールドを持つ', async () => {
    const manners = await fetchManners('ja');

    for (const manner of manners) {
      expect(manner.id).toBeTruthy();
      expect(manner.title).toBeTruthy();
      expect(manner.description).toBeTruthy();
      expect(manner.icon).toBeTruthy();
      expect(['manner', 'rule']).toContain(manner.kind);
      expect(['local', 'japan']).toContain(manner.scope);
      expect(Array.isArray(manner.relatedSpotIds)).toBe(true);
    }
  });

  it('id は重複しない', async () => {
    const manners = await fetchManners('ja');

    const ids = manners.map((manner) => manner.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('manner / rule と local / japan と関連スポットID有無が混在している', async () => {
    const manners = await fetchManners('ja');

    const kinds = new Set(manners.map((manner) => manner.kind));
    const scopes = new Set(manners.map((manner) => manner.scope));
    expect(kinds).toEqual(new Set(['manner', 'rule']));
    expect(scopes).toEqual(new Set(['local', 'japan']));
    expect(manners.some((manner) => manner.relatedSpotIds.length > 0)).toBe(true);
    expect(manners.some((manner) => manner.relatedSpotIds.length === 0)).toBe(true);
  });

  it('全対応言語で文言が揃っている', async () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const manners = await fetchManners(language);

      for (const manner of manners) {
        expect(manner.title).toBeTruthy();
        expect(manner.description).toBeTruthy();
      }
    }
  });

  it('返り値を変更しても内部の mock データには影響しない', async () => {
    const first = await fetchManners('ja');
    first[0].relatedSpotIds.push('tampered');
    first[0].title = 'tampered';

    const second = await fetchManners('ja');
    expect(second[0].title).not.toBe('tampered');
    expect(second[0].relatedSpotIds).not.toContain('tampered');
  });
});

describe('fetchMannerById', () => {
  it('存在する ID の項目を返す', async () => {
    const manner = await fetchMannerById('no-eating-while-walking', 'ja');

    expect(manner).not.toBeNull();
    expect(manner?.id).toBe('no-eating-while-walking');
    expect(manner?.title).toBeTruthy();
  });

  it('存在しない ID には null を返す', async () => {
    const manner = await fetchMannerById('unknown-id', 'ja');

    expect(manner).toBeNull();
  });
});
