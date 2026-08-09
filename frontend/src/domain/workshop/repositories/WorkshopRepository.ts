import type { Assessment, CheckIn, Workshop } from '@/domain/workshop/entities/Workshop';

export interface WorkshopFilters {
  companyId?: number;
  page?: number;
}

export interface WorkshopPage {
  workshops: Workshop[];
  currentPage: number;
  perPage: number;
  total: number;
}

export interface WorkshopRepository {
  list(filters?: WorkshopFilters): Promise<WorkshopPage>;
  find(id: number): Promise<Workshop>;
  checkIns(workshopId: number): Promise<CheckIn[]>;
  assessments(workshopId: number): Promise<Assessment[]>;
}
