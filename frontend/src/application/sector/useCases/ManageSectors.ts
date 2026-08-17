import type { Sector } from '@/domain/sector/entities/Sector';
import type {
  SectorFilters,
  SectorPage,
  SectorRepository,
} from '@/domain/sector/repositories/SectorRepository';

export class ListSectors {
  constructor(private readonly sectors: SectorRepository) {}

  execute(filters: SectorFilters = {}): Promise<SectorPage> {
    return this.sectors.list(filters);
  }
}

export class FindSector {
  constructor(private readonly sectors: SectorRepository) {}

  execute(id: number): Promise<Sector> {
    return this.sectors.find(id);
  }
}
