import { ValidationError } from '@/domain/shared/errors/AppError';
import type { NewSeed, Seed } from '@/domain/seed/entities/Seed';
import type { SeedRepository } from '@/domain/seed/repositories/SeedRepository';

export class CreateSeed {
  constructor(private readonly seeds: SeedRepository) {}

  execute(input: NewSeed): Promise<Seed> {
    const title = input.title.trim();
    const content = input.content.trim();

    const fields: Record<string, string[]> = {};
    if (title === '') fields.title = ['O título é obrigatório.'];
    if (content === '') fields.content = ['O conteúdo é obrigatório.'];

    if (Object.keys(fields).length > 0) {
      return Promise.reject(new ValidationError('Dados inválidos.', fields));
    }

    return this.seeds.create({ title, content });
  }
}