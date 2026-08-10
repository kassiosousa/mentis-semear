import type { Assessment, CheckIn, PublicWorkshop } from '@/domain/workshop/entities/Workshop';
import type {
  AssessmentInput,
  CheckInInput,
  PublicWorkshopRepository,
} from '@/domain/workshop/repositories/PublicWorkshopRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient, HttpRequestOptions } from '@/infrastructure/http/HttpClient';
import {
  toAssessment,
  toCheckIn,
  type AssessmentApiModel,
  type CheckInApiModel,
} from '@/infrastructure/workshop/HttpWorkshopRepository';

const ANONYMOUS: HttpRequestOptions = { skipAuth: true };

interface PublicWorkshopApiModel {
  id: number;
  datetime: string;
  address: string;
  company: string;
}

function toPublicWorkshop(model: PublicWorkshopApiModel): PublicWorkshop {
  return {
    id: model.id,
    datetime: model.datetime,
    address: model.address,
    company: model.company,
  };
}

function toCheckInBody(input: CheckInInput) {
  return {
    workshop_id: input.workshopId,
    name: input.name,
    position: input.position,
    sector: input.sector,
    cpf: input.cpf,
    birthday: input.birthday,
    gender: input.gender,
    celphone: input.celphone,
    email: input.email,
    lgpd_read: input.lgpdRead,
  };
}

function toAssessmentBody(input: AssessmentInput) {
  return {
    workshop_id: input.workshopId,
    score: input.score,
    suggestions: input.suggestions,
  };
}

export class HttpPublicWorkshopRepository implements PublicWorkshopRepository {
  constructor(private readonly http: HttpClient) {}

  async findByToken(token: string): Promise<PublicWorkshop> {
    const payload = await this.http.get<unknown>(
      `/public/workshops/${encodeURIComponent(token)}`,
      ANONYMOUS,
    );

    return toPublicWorkshop(unwrap<PublicWorkshopApiModel>(payload));
  }

  async registerCheckIn(input: CheckInInput): Promise<CheckIn> {
    const payload = await this.http.post<unknown>(
      '/public/check-ins',
      toCheckInBody(input),
      ANONYMOUS,
    );

    return toCheckIn(unwrap<CheckInApiModel>(payload));
  }

  async registerAssessment(input: AssessmentInput): Promise<Assessment> {
    const payload = await this.http.post<unknown>(
      '/public/assessments',
      toAssessmentBody(input),
      ANONYMOUS,
    );

    return toAssessment(unwrap<AssessmentApiModel>(payload));
  }
}
