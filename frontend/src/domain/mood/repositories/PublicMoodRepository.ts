import type { PublicCompany } from '@/domain/company/entities/PublicCompany';
import type { MoodEntry } from '@/domain/mood/entities/MoodEntry';

export interface MoodEntryInput {
  companyId: number;
  sectorId: number;
  mood: number;
  description: string | null;
}

export interface PublicMoodRepository {
  findCompanyByToken(token: string): Promise<PublicCompany>;
  registerMoodEntry(input: MoodEntryInput): Promise<MoodEntry>;
}
