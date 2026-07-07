import { filterMannersByKind } from '../filter-manners';

import type { MannerItem } from '../../../domain/manner-item';

const makeManner = (id: string, kind: MannerItem['kind']): MannerItem => ({
  id,
  kind,
  title: id,
  description: '',
  icon: id,
  scope: 'local',
  relatedSpotIds: [],
});

const MANNERS: MannerItem[] = [
  makeManner('no-trespassing', 'rule'),
  makeManner('no-smoking-while-walking', 'rule'),
  makeManner('show-consideration', 'manner'),
  makeManner('no-loud-conversation', 'manner'),
];

describe('filterMannersByKind', () => {
  it("'all' を指定すると全件を返す", () => {
    expect(filterMannersByKind(MANNERS, 'all')).toHaveLength(MANNERS.length);
  });

  it("'all' を指定すると同じ配列参照を返す", () => {
    expect(filterMannersByKind(MANNERS, 'all')).toBe(MANNERS);
  });

  it.each([
    ['rule', ['no-trespassing', 'no-smoking-while-walking']],
    ['manner', ['show-consideration', 'no-loud-conversation']],
  ] as const)("'%s' を指定すると該当項目のみ返す", (kind, expectedIds) => {
    const result = filterMannersByKind(MANNERS, kind);

    expect(result.map((manner) => manner.id)).toEqual(expectedIds);
  });

  it('該当項目がない場合は空配列を返す', () => {
    const mannersOnly = MANNERS.filter((manner) => manner.kind !== 'rule');

    expect(filterMannersByKind(mannersOnly, 'rule')).toHaveLength(0);
  });

  it('空配列を渡すと空配列を返す', () => {
    expect(filterMannersByKind([], 'manner')).toHaveLength(0);
  });
});
