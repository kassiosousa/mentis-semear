import type { NewSeed, Seed } from '../../domain/entities/Seed';
import type { SeedRepository } from '../../domain/repositories/SeedRepository';

export class CreateSeed {
  constructor(private readonly seeds: SeedRepository) {}

  execute(input: NewSeed): Promise<Seed> {
    const title = input.title.trim();
    const content = input.content.trim();

    if (title === '' || content === '') {
      return Promise.reject(new Error('Title and content are required.'));
    }

    return this.seeds.create({ title, content });
  }
}
