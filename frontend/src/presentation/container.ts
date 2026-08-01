import { CreateSeed } from '../application/useCases/CreateSeed';
import { ListSeeds } from '../application/useCases/ListSeeds';
import { HttpSeedRepository } from '../infrastructure/repositories/HttpSeedRepository';

// Composition root: wire concrete implementations to use cases in one place.
const seedRepository = new HttpSeedRepository();

export const container = {
  listSeeds: new ListSeeds(seedRepository),
  createSeed: new CreateSeed(seedRepository),
};
