import type { Assessment, CheckIn, Workshop } from '@/domain/workshop/entities/Workshop';
import type {
  WorkshopFilters,
  WorkshopPage,
  WorkshopRepository,
} from '@/domain/workshop/repositories/WorkshopRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface WorkshopApiModel {
  id: number;
  company_id: number;
  user_creator_id: string;
  user_facilitator_id?: string | null;
  datetime: string;
  address: string;
  checkin_link?: string | null;
  assessment_link?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface CheckInApiModel {
  id: number;
  workshop_id: number;
  name: string;
  position?: string | null;
  sector?: string | null;
  cpf?: string | null;
  birthday?: string | null;
  gender?: string | null;
  celphone?: string | null;
  email?: string | null;
  lgpd_read?: boolean | null;
  lgpd_consent_at?: string | null;
  created_at?: string | null;
}

interface AssessmentApiModel {
  id: number;
  workshop_id: number;
  score: number;
  suggestions?: string | null;
  created_at?: string | null;
}

interface Paginated<T> {
  data?: T[];
  current_page?: number;
  per_page?: number;
  total?: number;
}

function rowsOf<T>(payload: Paginated<T> | T[]): T[] {
  return Array.isArray(payload) ? payload : (payload.data ?? []);
}

function toWorkshop(model: WorkshopApiModel): Workshop {
  return {
    id: model.id,
    companyId: model.company_id,
    creatorId: model.user_creator_id,
    facilitatorId: model.user_facilitator_id ?? null,
    datetime: model.datetime,
    address: model.address,
    checkinLink: model.checkin_link ?? null,
    assessmentLink: model.assessment_link ?? null,
    createdAt: model.created_at ?? null,
    updatedAt: model.updated_at ?? null,
  };
}

function toCheckIn(model: CheckInApiModel): CheckIn {
  return {
    id: model.id,
    workshopId: model.workshop_id,
    name: model.name,
    position: model.position ?? null,
    sector: model.sector ?? null,
    cpf: model.cpf ?? null,
    birthday: model.birthday ?? null,
    gender: model.gender ?? null,
    celphone: model.celphone ?? null,
    email: model.email ?? null,
    lgpdRead: model.lgpd_read === true,
    lgpdConsentAt: model.lgpd_consent_at ?? null,
    createdAt: model.created_at ?? null,
  };
}

function toAssessment(model: AssessmentApiModel): Assessment {
  return {
    id: model.id,
    workshopId: model.workshop_id,
    score: model.score,
    suggestions: model.suggestions ?? null,
    createdAt: model.created_at ?? null,
  };
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
