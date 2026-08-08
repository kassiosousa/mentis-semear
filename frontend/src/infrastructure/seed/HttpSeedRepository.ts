import type { NewSeed, Seed } from '@/domain/seed/entities/Seed';
import type { SeedRepository } from '@/domain/seed/repositories/SeedRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface SeedApiModel {
  id: number;
  title: string;
  content: string;
  planted_at: string;
}

export class HttpSeedRepository implements SeedRepository {
  constructor(private readonly http: HttpClient) {}

  async list(): Promise<Seed[]> {
    const payload = await this.http.get<unknown>('/seeds');

    return unwrap<SeedApiModel[]>(payload).map(HttpSeedRepository.toEntity);
  }

  async create(seed: NewSeed): Promise<Seed> {
    const payload = await this.http.post<unknown>('/seeds', seed);

    return HttpSeedRepository.toEntity(unwrap<SeedApiModel>(payload));
  }

  private static toEntity(model: SeedApiModel): Seed {
    return {
      id: model.id,
      title: model.title,
      content: model.content,
      plantedAt: model.planted_at,
    };
  }
}