import { useQuery } from '@tanstack/react-query';
import type { MoodSummary } from '@/domain/mood/entities/MoodSummary';
import type { MoodSummaryFilters } from '@/domain/mood/repositories/MoodRepository';
import { container } from '@/presentation/container';

export const moodKeys = {
  all: ['mood-entries'] as const,
  summary: (filters: MoodSummaryFilters) => [...moodKeys.all, 'summary', filters] as const,
};

export function useMoodSummary(filters: MoodSummaryFilters, enabled = true) {
  return useQuery<MoodSummary>({
    queryKey: moodKeys.summary(filters),
    queryFn: () => container.moods.summary.execute(filters),
    staleTime: 60_000,
    enabled,
  });
}
