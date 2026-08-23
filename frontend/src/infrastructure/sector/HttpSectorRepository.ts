import type { Sector, SectorInput } from '@/domain/sector/entities/Sector';
import type {
  SectorFilters,
  SectorPage,
  SectorRepository,
} from '@/domain/sector/repositories/SectorRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface SectorApiModel {
  id: number;
  company_id: number;
  name: string;
  created_at?: string | null;
  updated_at?: string | null;
}

interface SectorsApiPage {
  data?: SectorApiModel[];
  current_page?: number;
  per_page?: number;
  total?: number;
}

function toEntity(model: SectorApiModel): Sector {
  return {
    id: model.id,
    companyId: model.company_id,
    name: model.name,
    createdAt: model.created_at ?? null,
    updatedAt: model.updated_at ?? null,
  };
}

export class HttpSectorRepository implements SectorRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filters: SectorFilters = {}): Promise<SectorPage> {
    const payload = await this.http.get<SectorsApiPage | SectorApiModel[]>('/sectors', {
      params: {
        company_id: filters.companyId,
        page: filters.page,
      },
    });

    if (Array.isArray(payload)) {
      return {
        sectors: payload.map(toEntity),
        currentPage: 1,
        perPage: payload.length,
        total: payload.length,
      };
    }

    const models = payload.data ?? [];

    return {
      sectors: models.map(toEntity),
      currentPage: payload.current_page ?? 1,
      perPage: payload.per_page ?? models.length,
      total: payload.total ?? models.length,
    };
  }

  async find(id: number): Promise<Sector> {
    const payload = await this.http.get<unknown>(`/sectors/${id}`);

    return toEntity(unwrap<SectorApiModel>(payload));
  }

  async create(input: SectorInput): Promise<Sector> {
    const payload = await this.http.post<unknown>('/sectors', {
      company_id: input.companyId,
      name: input.name,
    });

    return toEntity(unwrap<SectorApiModel>(payload));
  }

  async update(id: number, input: SectorInput): Promise<Sector> {
    const payload = await this.http.put<unknown>(`/sectors/${id}`, { name: input.name });

    return toEntity(unwrap<SectorApiModel>(payload));
  }

  async remove(id: number): Promise<void> {
    await this.http.delete<unknown>(`/sectors/${id}`);
  }
}
