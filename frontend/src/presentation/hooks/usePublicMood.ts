import { useMutation, useQuery } from '@tanstack/react-query';
import type { PublicCompany } from '@/domain/company/entities/PublicCompany';
import type { MoodEntry } from '@/domain/mood/entities/MoodEntry';
import type { MoodEntryInput } from '@/domain/mood/repositories/PublicMoodRepository';
import { container } from '@/presentation/container';

export const publicCompanyKeys = {
  all: ['public-companies'] as const,
  detail: (token: string) => [...publicCompanyKeys.all, token] as const,
};

export function usePublicCompany(token: string) {
  return useQuery<PublicCompany>({
    queryKey: publicCompanyKeys.detail(token),
    queryFn: () => container.publicMoods.findCompanyByToken.execute(token),
    staleTime: 5 * 60_000,
    meta: { silentError: true },
  });
}

export function useRegisterMoodEntry() {
  return useMutation<MoodEntry, Error, MoodEntryInput>({
    mutationFn: (input) => container.publicMoods.register.execute(input),
  });
}
