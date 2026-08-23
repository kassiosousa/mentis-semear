import type { Sector, SectorInput } from '@/domain/sector/entities/Sector';
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

export class CreateSector {
  constructor(private readonly sectors: SectorRepository) {}

  execute(input: SectorInput): Promise<Sector> {
    return this.sectors.create(input);
  }
}

export class UpdateSector {
  constructor(private readonly sectors: SectorRepository) {}

  execute(id: number, input: SectorInput): Promise<Sector> {
    return this.sectors.update(id, input);
  }
}

export class DeleteSector {
  constructor(private readonly sectors: SectorRepository) {}

  execute(id: number): Promise<void> {
    return this.sectors.remove(id);
  }
}
