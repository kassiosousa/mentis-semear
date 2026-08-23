import type { Sector, SectorInput } from '@/domain/sector/entities/Sector';

export interface SectorFilters {
  companyId?: number;
  page?: number;
}

export interface SectorPage {
  sectors: Sector[];
  currentPage: number;
  perPage: number;
  total: number;
}

export interface SectorRepository {
  list(filters?: SectorFilters): Promise<SectorPage>;
  find(id: number): Promise<Sector>;
  create(input: SectorInput): Promise<Sector>;
  update(id: number, input: SectorInput): Promise<Sector>;
  remove(id: number): Promise<void>;
}
