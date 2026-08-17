import type { MoodSummary } from '@/domain/mood/entities/MoodSummary';

export interface MoodSummaryFilters {
  companyId?: number;
  sectorId?: number;
}

export interface MoodRepository {
  summary(filters?: MoodSummaryFilters): Promise<MoodSummary>;
}
