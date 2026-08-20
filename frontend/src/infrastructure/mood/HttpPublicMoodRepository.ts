import type { PublicCompany, PublicSector } from '@/domain/company/entities/PublicCompany';
import type { MoodEntry } from '@/domain/mood/entities/MoodEntry';
import type {
  MoodEntryInput,
  PublicMoodRepository,
} from '@/domain/mood/repositories/PublicMoodRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient, HttpRequestOptions } from '@/infrastructure/http/HttpClient';

const ANONYMOUS: HttpRequestOptions = { skipAuth: true };

interface PublicSectorApiModel {
  id: number;
  name: string;
}

interface PublicCompanyApiModel {
  id: number;
  name: string;
  sectors?: PublicSectorApiModel[] | null;
}

interface MoodEntryApiModel {
  id: number;
  company_id: number;
  sector_id?: number | null;
  mood: number;
  description?: string | null;
  created_at?: string | null;
}

function toSector(model: PublicSectorApiModel): PublicSector {
  return { id: model.id, name: model.name };
}

function toPublicCompany(model: PublicCompanyApiModel): PublicCompany {
  return {
    id: model.id,
    name: model.name,
    sectors: (model.sectors ?? []).map(toSector),
  };
}

function toMoodEntry(model: MoodEntryApiModel): MoodEntry {
  return {
    id: model.id,
    companyId: model.company_id,
    sectorId: model.sector_id ?? null,
    mood: model.mood,
    description: model.description ?? null,
    createdAt: model.created_at ?? null,
  };
}

function toMoodEntryBody(input: MoodEntryInput) {
  return {
    company_id: input.companyId,
    sector_id: input.sectorId,
    mood: input.mood,
    description: input.description,
  };
}

export class HttpPublicMoodRepository implements PublicMoodRepository {
  constructor(private readonly http: HttpClient) {}

  async findCompanyByToken(token: string): Promise<PublicCompany> {
    const payload = await this.http.get<unknown>(
      `/public/companies/${encodeURIComponent(token)}`,
      ANONYMOUS,
    );

    return toPublicCompany(unwrap<PublicCompanyApiModel>(payload));
  }

  async registerMoodEntry(input: MoodEntryInput): Promise<MoodEntry> {
    const payload = await this.http.post<unknown>(
      '/public/mood-entries',
      toMoodEntryBody(input),
      ANONYMOUS,
    );

    return toMoodEntry(unwrap<MoodEntryApiModel>(payload));
  }
}
