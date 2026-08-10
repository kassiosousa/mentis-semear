import type {
  Assessment,
  CheckIn,
  PublicWorkshop,
  Workshop,
} from '@/domain/workshop/entities/Workshop';
import type {
  AssessmentInput,
  CheckInInput,
} from '@/domain/workshop/repositories/PublicWorkshopRepository';
import type { WorkshopInput } from '@/domain/workshop/repositories/WorkshopRepository';

export interface WorkshopApiModel {
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

export interface PublicWorkshopApiModel {
  id: number;
  datetime: string;
  address: string;
  company: string;
}

export interface CheckInApiModel {
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

export interface AssessmentApiModel {
  id: number;
  workshop_id: number;
  score: number;
  suggestions?: string | null;
  created_at?: string | null;
}

export function toWorkshop(model: WorkshopApiModel): Workshop {
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

export function toPublicWorkshop(model: PublicWorkshopApiModel): PublicWorkshop {
  return {
    id: model.id,
    datetime: model.datetime,
    address: model.address,
    company: model.company,
  };
}

export function toCheckIn(model: CheckInApiModel): CheckIn {
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

export function toAssessment(model: AssessmentApiModel): Assessment {
  return {
    id: model.id,
    workshopId: model.workshop_id,
    score: model.score,
    suggestions: model.suggestions ?? null,
    createdAt: model.created_at ?? null,
  };
}

export function toWorkshopBody(input: WorkshopInput) {
  return {
    company_id: input.companyId,
    user_facilitator_id: input.facilitatorId,
    datetime: input.datetime,
    address: input.address,
    checkin_link: input.checkinLink,
    assessment_link: input.assessmentLink,
  };
}

export function toCheckInBody(input: CheckInInput) {
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

export function toAssessmentBody(input: AssessmentInput) {
  return {
    workshop_id: input.workshopId,
    score: input.score,
    suggestions: input.suggestions,
  };
}
