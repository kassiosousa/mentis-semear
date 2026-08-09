import type { Assessment, CheckIn, Workshop } from '@/domain/workshop/entities/Workshop';
import type {
  WorkshopFilters,
  WorkshopInput,
  WorkshopPage,
  WorkshopRepository,
} from '@/domain/workshop/repositories/WorkshopRepository';

export class ListWorkshops {
  constructor(private readonly workshops: WorkshopRepository) {}

  execute(filters: WorkshopFilters = {}): Promise<WorkshopPage> {
    return this.workshops.list(filters);
  }
}

export class FindWorkshop {
  constructor(private readonly workshops: WorkshopRepository) {}

  execute(id: number): Promise<Workshop> {
    return this.workshops.find(id);
  }
}

export class CreateWorkshop {
  constructor(private readonly workshops: WorkshopRepository) {}

  execute(input: WorkshopInput): Promise<Workshop> {
    return this.workshops.create(input);
  }
}

export class UpdateWorkshop {
  constructor(private readonly workshops: WorkshopRepository) {}

  execute(id: number, input: WorkshopInput): Promise<Workshop> {
    return this.workshops.update(id, input);
  }
}

export class DeleteWorkshop {
  constructor(private readonly workshops: WorkshopRepository) {}

  execute(id: number): Promise<void> {
    return this.workshops.remove(id);
  }
}

export class ListWorkshopCheckIns {
  constructor(private readonly workshops: WorkshopRepository) {}

  execute(workshopId: number): Promise<CheckIn[]> {
    return this.workshops.checkIns(workshopId);
  }
}

export class ListWorkshopAssessments {
  constructor(private readonly workshops: WorkshopRepository) {}

  execute(workshopId: number): Promise<Assessment[]> {
    return this.workshops.assessments(workshopId);
  }
}
