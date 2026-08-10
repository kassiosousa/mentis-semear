import type { Diary, DiaryInput, DiaryUpdate } from '@/domain/diary/entities/Diary';

export interface DiaryRepository {
  findByWorkshop(workshopId: number): Promise<Diary | null>;
  create(input: DiaryInput): Promise<Diary>;
  update(id: number, input: DiaryUpdate): Promise<Diary>;
}
