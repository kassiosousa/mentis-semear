import type { PublicCompany } from '@/domain/company/entities/PublicCompany';
import type { MoodEntry } from '@/domain/mood/entities/MoodEntry';
import type {
  MoodEntryInput,
  PublicMoodRepository,
} from '@/domain/mood/repositories/PublicMoodRepository';

export class FindPublicCompany {
  constructor(private readonly moods: PublicMoodRepository) {}

  execute(token: string): Promise<PublicCompany> {
    return this.moods.findCompanyByToken(token);
  }
}

export class RegisterMoodEntry {
  constructor(private readonly moods: PublicMoodRepository) {}

  execute(input: MoodEntryInput): Promise<MoodEntry> {
    return this.moods.registerMoodEntry(input);
  }
}
