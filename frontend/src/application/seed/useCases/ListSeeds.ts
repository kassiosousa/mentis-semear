import type { Seed } from '@/domain/seed/entities/Seed';
import type { SeedRepository } from '@/domain/seed/repositories/SeedRepository';

export class ListSeeds {
  constructor(private readonly seeds: SeedRepository) {}

  execute(): Promise<Seed[]> {
    return this.seeds.list();
  }
}