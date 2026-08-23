import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Sector, SectorInput } from '@/domain/sector/entities/Sector';
import type { SectorFilters, SectorPage } from '@/domain/sector/repositories/SectorRepository';
import { container } from '@/presentation/container';
import { moodKeys } from '@/presentation/hooks/useMoodSummary';

export const sectorKeys = {
  all: ['sectors'] as const,
  list: (filters: SectorFilters) => [...sectorKeys.all, 'list', filters] as const,
  detail: (id: number) => [...sectorKeys.all, 'detail', id] as const,
};

export function useSectors(filters: SectorFilters, enabled = true) {
  return useQuery<SectorPage>({
    queryKey: sectorKeys.list(filters),
    queryFn: () => container.sectors.list.execute(filters),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useSector(id: number) {
  return useQuery<Sector>({
    queryKey: sectorKeys.detail(id),
    queryFn: () => container.sectors.find.execute(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCreateSector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SectorInput) => container.sectors.create.execute(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sectorKeys.all }),
  });
}

export function useUpdateSector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: SectorInput }) =>
      container.sectors.update.execute(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sectorKeys.all }),
  });
}

export function useDeleteSector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => container.sectors.remove.execute(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: sectorKeys.all });
      await queryClient.invalidateQueries({ queryKey: moodKeys.all });
    },
  });
}
