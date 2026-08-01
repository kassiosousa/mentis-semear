import type { Seed } from '../../domain/entities/Seed';
import type { SeedRepository } from '../../domain/repositories/SeedRepository';

// Application use case: depends only on the domain contract.
export class ListSeeds {
  constructor(private readonly seeds: SeedRepository) {}

  execute(): Promise<Seed[]> {
    return this.seeds.list();
  }
}
