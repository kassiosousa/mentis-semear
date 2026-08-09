import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Assessment, CheckIn, Workshop } from '@/domain/workshop/entities/Workshop';
import type {
  WorkshopFilters,
  WorkshopInput,
  WorkshopPage,
} from '@/domain/workshop/repositories/WorkshopRepository';
import { container } from '@/presentation/container';

export const workshopKeys = {
  all: ['workshops'] as const,
  list: (filters: WorkshopFilters) => [...workshopKeys.all, 'list', filters] as const,
  detail: (id: number) => [...workshopKeys.all, 'detail', id] as const,
  checkIns: (id: number) => [...workshopKeys.all, 'check-ins', id] as const,
  assessments: (id: number) => [...workshopKeys.all, 'assessments', id] as const,
};

export function useWorkshops(filters: WorkshopFilters) {
  return useQuery<WorkshopPage>({
    queryKey: workshopKeys.list(filters),
    queryFn: () => container.workshops.list.execute(filters),
    placeholderData: keepPreviousData,
  });
}

export function useWorkshop(id: number) {
  return useQuery<Workshop>({
    queryKey: workshopKeys.detail(id),
    queryFn: () => container.workshops.find.execute(id),
  });
}

export function useCreateWorkshop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: WorkshopInput) => container.workshops.create.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workshopKeys.all }),
  });
}

export function useUpdateWorkshop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: WorkshopInput }) =>
      container.workshops.update.execute(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workshopKeys.all }),
  });
}

export function useDeleteWorkshop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => container.workshops.remove.execute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: workshopKeys.all }),
  });
}

export function useWorkshopCheckIns(id: number) {
  return useQuery<CheckIn[]>({
    queryKey: workshopKeys.checkIns(id),
    queryFn: () => container.workshops.checkIns.execute(id),
    staleTime: 60_000,
  });
}

export function useWorkshopAssessments(id: number) {
  return useQuery<Assessment[]>({
    queryKey: workshopKeys.assessments(id),
    queryFn: () => container.workshops.assessments.execute(id),
    staleTime: 60_000,
  });
}
