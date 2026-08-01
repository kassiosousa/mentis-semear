import type { NewSeed, Seed } from '../../domain/entities/Seed';
import type { SeedRepository } from '../../domain/repositories/SeedRepository';
import { HttpClient } from '../http/HttpClient';

interface SeedApiModel {
  id: number;
  title: string;
  content: string;
  planted_at: string;
}

interface Envelope<T> {
  data: T;
}

// Implements the domain contract over the HTTP API.
export class HttpSeedRepository implements SeedRepository {
  constructor(private readonly http: HttpClient = new HttpClient()) {}

  async list(): Promise<Seed[]> {
    const response = await this.http.get<Envelope<SeedApiModel[]>>('/seeds');
    return response.data.map(HttpSeedRepository.toEntity);
  }

  async create(seed: NewSeed): Promise<Seed> {
    const response = await this.http.post<Envelope<SeedApiModel>>('/seeds', seed);
    return HttpSeedRepository.toEntity(response.data);
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
