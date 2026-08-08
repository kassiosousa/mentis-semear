import type { NewSeed, Seed } from '@/domain/seed/entities/Seed';

export interface SeedRepository {
  list(): Promise<Seed[]>;
  create(seed: NewSeed): Promise<Seed>;
}