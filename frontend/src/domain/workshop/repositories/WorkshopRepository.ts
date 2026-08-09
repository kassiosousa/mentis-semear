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

export interface WorkshopInput {
  companyId: number;
  facilitatorId: string | null;
  datetime: string;
  address: string;
  checkinLink: string;
  assessmentLink: string;
}

export interface WorkshopRepository {
  list(filters?: WorkshopFilters): Promise<WorkshopPage>;
  find(id: number): Promise<Workshop>;
  create(input: WorkshopInput): Promise<Workshop>;
  update(id: number, input: WorkshopInput): Promise<Workshop>;
  remove(id: number): Promise<void>;
  checkIns(workshopId: number): Promise<CheckIn[]>;
  assessments(workshopId: number): Promise<Assessment[]>;
}
