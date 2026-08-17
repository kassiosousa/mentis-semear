import type { MoodScore, MoodSummary, SectorMood } from '@/domain/mood/entities/MoodSummary';
import { MOOD_SCORES } from '@/domain/mood/entities/MoodSummary';
import type { MoodRepository, MoodSummaryFilters } from '@/domain/mood/repositories/MoodRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface SectorMoodApiModel {
  sector_id?: number | null;
  sector?: string | null;
  total?: number | null;
  average?: number | null;
}

interface MoodSummaryApiModel {
  total?: number | null;
  average?: number | null;
  distribution?: Record<string, number> | null;
  by_sector?: SectorMoodApiModel[] | null;
}

function toSectorMood(model: SectorMoodApiModel): SectorMood {
  return {
    sectorId: model.sector_id ?? null,
    sectorName: model.sector ?? null,
    total: Number(model.total ?? 0),
    average: Number(model.average ?? 0),
  };
}

function toDistribution(raw: Record<string, number> | null | undefined): Record<MoodScore, number> {
  const distribution = {} as Record<MoodScore, number>;

  for (const score of MOOD_SCORES) {
    distribution[score] = Number(raw?.[String(score)] ?? 0);
  }

  return distribution;
}

export class HttpMoodRepository implements MoodRepository {
  constructor(private readonly http: HttpClient) {}

  async summary(filters: MoodSummaryFilters = {}): Promise<MoodSummary> {
    const payload = await this.http.get<unknown>('/mood-entries/summary', {
      params: {
        company_id: filters.companyId,
        sector_id: filters.sectorId,
      },
    });

    const model = unwrap<MoodSummaryApiModel>(payload);

    return {
      total: Number(model.total ?? 0),
      average: model.average == null ? null : Number(model.average),
      distribution: toDistribution(model.distribution),
      bySector: (model.by_sector ?? []).map(toSectorMood),
    };
  }
}
