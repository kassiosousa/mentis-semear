import { useMutation, useQuery } from '@tanstack/react-query';
import type { Assessment, CheckIn, PublicWorkshop } from '@/domain/workshop/entities/Workshop';
import type {
  AssessmentInput,
  CheckInInput,
} from '@/domain/workshop/repositories/PublicWorkshopRepository';
import { container } from '@/presentation/container';

export const publicWorkshopKeys = {
  all: ['public-workshops'] as const,
  detail: (token: string) => [...publicWorkshopKeys.all, token] as const,
};

export function usePublicWorkshop(token: string) {
  return useQuery<PublicWorkshop>({
    queryKey: publicWorkshopKeys.detail(token),
    queryFn: () => container.publicWorkshops.findByToken.execute(token),
    staleTime: 5 * 60_000,
    meta: { silentError: true },
  });
}

export function useRegisterCheckIn() {
  return useMutation<CheckIn, Error, CheckInInput>({
    mutationFn: (input) => container.publicWorkshops.checkIn.execute(input),
  });
}

export function useRegisterAssessment() {
  return useMutation<Assessment, Error, AssessmentInput>({
    mutationFn: (input) => container.publicWorkshops.assess.execute(input),
  });
}
