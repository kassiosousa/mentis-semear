import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Sector } from '@/domain/sector/entities/Sector';
import type { SectorFilters, SectorPage } from '@/domain/sector/repositories/SectorRepository';
import { container } from '@/presentation/container';

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
