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
  toAssessmentBody,
  toCheckIn,
  toCheckInBody,
  toPublicWorkshop,
  type AssessmentApiModel,
  type CheckInApiModel,
  type PublicWorkshopApiModel,
} from '@/infrastructure/workshop/workshopMappers';

const ANONYMOUS: HttpRequestOptions = { skipAuth: true };

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
