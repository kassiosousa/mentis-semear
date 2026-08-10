import type { Assessment, CheckIn, Workshop } from '@/domain/workshop/entities/Workshop';
import type {
  WorkshopFilters,
  WorkshopInput,
  WorkshopPage,
  WorkshopRepository,
} from '@/domain/workshop/repositories/WorkshopRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';
import {
  toAssessment,
  toCheckIn,
  toWorkshop,
  toWorkshopBody,
  type AssessmentApiModel,
  type CheckInApiModel,
  type WorkshopApiModel,
} from '@/infrastructure/workshop/workshopMappers';

interface Paginated<T> {
  data?: T[];
  current_page?: number;
  per_page?: number;
  total?: number;
}

function rowsOf<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : (payload.data ?? []);
}

export class HttpWorkshopRepository implements WorkshopRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filters: WorkshopFilters = {}): Promise<WorkshopPage> {
    const payload = await this.http.get<Paginated<WorkshopApiModel> | WorkshopApiModel[]>(
      '/workshops',
      { params: { company_id: filters.companyId, page: filters.page } },
    );

    const models = rowsOf(payload);
    const meta = Array.isArray(payload) ? {} : payload;

    return {
      workshops: models.map(toWorkshop),
      currentPage: meta.current_page ?? 1,
      perPage: meta.per_page ?? models.length,
      total: meta.total ?? models.length,
    };
  }

  async find(id: number): Promise<Workshop> {
    const payload = await this.http.get<unknown>(`/workshops/${id}`);

    return toWorkshop(unwrap<WorkshopApiModel>(payload));
  }

  async create(input: WorkshopInput): Promise<Workshop> {
    const payload = await this.http.post<unknown>('/workshops', toWorkshopBody(input));

    return toWorkshop(unwrap<WorkshopApiModel>(payload));
  }

  async update(id: number, input: WorkshopInput): Promise<Workshop> {
    const payload = await this.http.put<unknown>(`/workshops/${id}`, toWorkshopBody(input));

    return toWorkshop(unwrap<WorkshopApiModel>(payload));
  }

  async remove(id: number): Promise<void> {
    await this.http.delete<unknown>(`/workshops/${id}`);
  }

  async checkIns(workshopId: number): Promise<CheckIn[]> {
    const payload = await this.http.get<Paginated<CheckInApiModel> | CheckInApiModel[]>(
      '/check-ins',
      { params: { workshop_id: workshopId } },
    );

    return rowsOf(payload).map(toCheckIn);
  }

  async assessments(workshopId: number): Promise<Assessment[]> {
    const payload = await this.http.get<Paginated<AssessmentApiModel> | AssessmentApiModel[]>(
      '/assessments',
      { params: { workshop_id: workshopId } },
    );

    return rowsOf(payload).map(toAssessment);
  }
}
