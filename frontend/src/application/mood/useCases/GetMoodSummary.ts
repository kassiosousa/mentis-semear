import type { MoodSummary } from '@/domain/mood/entities/MoodSummary';
import type { MoodRepository, MoodSummaryFilters } from '@/domain/mood/repositories/MoodRepository';

export class GetMoodSummary {
  constructor(private readonly moods: MoodRepository) {}

  execute(filters: MoodSummaryFilters = {}): Promise<MoodSummary> {
    return this.moods.summary(filters);
  }
}
