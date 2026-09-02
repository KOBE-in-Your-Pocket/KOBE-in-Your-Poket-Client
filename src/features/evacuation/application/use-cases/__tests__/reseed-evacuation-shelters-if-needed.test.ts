import type { EvacuationShelter } from '../../../domain/evacuation-shelter';
import type { EvacuationShelterRepository } from '../../../domain/evacuation-shelter-repository';
import { reseedEvacuationSheltersIfNeeded } from '../reseed-evacuation-shelters-if-needed';

const mockShelters: EvacuationShelter[] = [
  {
    id: 'shelter-1',
    name: '避難所A',
    address: '住所A',
    coordinates: { latitude: 34.69, longitude: 135.19 },
    type: 'emergency',
    facilityCategory: 'park',
    media: { imageUrl: 'https://example.com/a.jpg' },
    accessible: true,
  },
];

function createRepository(
  overrides: Partial<EvacuationShelterRepository> = {},
): EvacuationShelterRepository {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn(),
    replaceAll: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createDeps(
  overrides: Partial<Parameters<typeof reseedEvacuationSheltersIfNeeded>[0]> = {},
) {
  return {
    repository: createRepository(),
    fetchShelters: jest.fn().mockResolvedValue(mockShelters),
    language: 'ja' as const,
    getLastSeededLanguage: jest.fn().mockResolvedValue(null),
    setLastSeededLanguage: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('reseedEvacuationSheltersIfNeeded', () => {
  it('DB が空のとき取得して投入する', async () => {
    const deps = createDeps({
      repository: createRepository({ findAll: jest.fn().mockResolvedValue([]) }),
      getLastSeededLanguage: jest.fn().mockResolvedValue('ja'),
    });

    await expect(reseedEvacuationSheltersIfNeeded(deps)).resolves.toBe(true);

    expect(deps.fetchShelters).toHaveBeenCalledWith('ja');
    expect(deps.repository.replaceAll).toHaveBeenCalledWith(mockShelters);
    expect(deps.setLastSeededLanguage).toHaveBeenCalledWith('ja');
  });

  it('DB にデータがあり、最後にシードした言語が同じときは取得せず投入しない', async () => {
    const deps = createDeps({
      repository: createRepository({ findAll: jest.fn().mockResolvedValue(mockShelters) }),
      getLastSeededLanguage: jest.fn().mockResolvedValue('ja'),
      language: 'ja',
    });

    await expect(reseedEvacuationSheltersIfNeeded(deps)).resolves.toBe(false);

    expect(deps.fetchShelters).not.toHaveBeenCalled();
    expect(deps.repository.replaceAll).not.toHaveBeenCalled();
    expect(deps.setLastSeededLanguage).not.toHaveBeenCalled();
  });

  it('DB にデータがあっても、最後にシードした言語が異なるときは新しい言語で取得し直す', async () => {
    const deps = createDeps({
      repository: createRepository({ findAll: jest.fn().mockResolvedValue(mockShelters) }),
      getLastSeededLanguage: jest.fn().mockResolvedValue('en'),
      language: 'ja',
    });

    await expect(reseedEvacuationSheltersIfNeeded(deps)).resolves.toBe(true);

    expect(deps.fetchShelters).toHaveBeenCalledWith('ja');
    expect(deps.repository.replaceAll).toHaveBeenCalledWith(mockShelters);
    expect(deps.setLastSeededLanguage).toHaveBeenCalledWith('ja');
  });

  it('最後にシードした言語の記録が無いとき（ドリフト）は DB にデータがあっても取得し直す', async () => {
    const deps = createDeps({
      repository: createRepository({ findAll: jest.fn().mockResolvedValue(mockShelters) }),
      getLastSeededLanguage: jest.fn().mockResolvedValue(null),
      language: 'ja',
    });

    await expect(reseedEvacuationSheltersIfNeeded(deps)).resolves.toBe(true);

    expect(deps.fetchShelters).toHaveBeenCalledWith('ja');
    expect(deps.repository.replaceAll).toHaveBeenCalledWith(mockShelters);
  });
});
