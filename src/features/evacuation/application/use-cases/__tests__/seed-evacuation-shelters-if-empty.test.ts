import type { EvacuationShelter } from '../../../domain/evacuation-shelter';
import type { EvacuationShelterRepository } from '../../../domain/evacuation-shelter-repository';
import { seedEvacuationSheltersIfEmpty } from '../seed-evacuation-shelters-if-empty';

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

describe('seedEvacuationSheltersIfEmpty', () => {
  it('DB が空のとき mock データを投入する', async () => {
    const repository = createRepository();
    const fetchShelters = jest.fn().mockResolvedValue(mockShelters);

    await expect(seedEvacuationSheltersIfEmpty({ repository, fetchShelters })).resolves.toBe(true);

    expect(fetchShelters).toHaveBeenCalledTimes(1);
    expect(repository.replaceAll).toHaveBeenCalledWith(mockShelters);
  });

  it('DB にデータがあるときは fetch せず投入しない', async () => {
    const repository = createRepository({
      findAll: jest.fn().mockResolvedValue(mockShelters),
    });
    const fetchShelters = jest.fn();

    await expect(seedEvacuationSheltersIfEmpty({ repository, fetchShelters })).resolves.toBe(false);

    expect(fetchShelters).not.toHaveBeenCalled();
    expect(repository.replaceAll).not.toHaveBeenCalled();
  });
});
