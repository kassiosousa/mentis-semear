import type { Assessment, CheckIn, PublicWorkshop } from '@/domain/workshop/entities/Workshop';

export interface CheckInInput {
  workshopId: number;
  name: string;
  position: string;
  sector: string;
  cpf: string;
  birthday: string;
  gender: string;
  celphone: string;
  email: string | null;
  lgpdRead: boolean;
}

export interface AssessmentInput {
  workshopId: number;
  score: number;
  suggestions: string | null;
}

export interface PublicWorkshopRepository {
  findByToken(token: string): Promise<PublicWorkshop>;
  registerCheckIn(input: CheckInInput): Promise<CheckIn>;
  registerAssessment(input: AssessmentInput): Promise<Assessment>;
}
