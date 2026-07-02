import type { EvacuationShelter } from '../../domain/evacuation-shelter';
import type { EvacuationShelterRepository } from '../../domain/evacuation-shelter-repository';

export type SeedEvacuationSheltersDeps = {
  repository: EvacuationShelterRepository;
  fetchShelters: () => Promise<EvacuationShelter[]>;
};

export async function seedEvacuationSheltersIfEmpty(
  deps: SeedEvacuationSheltersDeps,
): Promise<boolean> {
  const existing = await deps.repository.findAll();
  if (existing.length > 0) {
    return false;
  }

  const shelters = await deps.fetchShelters();
  await deps.repository.replaceAll(shelters);
  return true;
}
