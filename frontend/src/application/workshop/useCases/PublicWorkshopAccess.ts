import type { Assessment, CheckIn, PublicWorkshop } from '@/domain/workshop/entities/Workshop';
import type {
  AssessmentInput,
  CheckInInput,
  PublicWorkshopRepository,
} from '@/domain/workshop/repositories/PublicWorkshopRepository';

export class FindPublicWorkshop {
  constructor(private readonly workshops: PublicWorkshopRepository) {}

  execute(token: string): Promise<PublicWorkshop> {
    return this.workshops.findByToken(token);
  }
}

export class RegisterCheckIn {
  constructor(private readonly workshops: PublicWorkshopRepository) {}

  execute(input: CheckInInput): Promise<CheckIn> {
    return this.workshops.registerCheckIn(input);
  }
}

export class RegisterAssessment {
  constructor(private readonly workshops: PublicWorkshopRepository) {}

  execute(input: AssessmentInput): Promise<Assessment> {
    return this.workshops.registerAssessment(input);
  }
}
