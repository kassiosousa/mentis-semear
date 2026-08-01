import type { NewSeed, Seed } from '../entities/Seed';

// Contract owned by the domain. Infrastructure provides the implementation.
export interface SeedRepository {
  list(): Promise<Seed[]>;
  create(seed: NewSeed): Promise<Seed>;
}
