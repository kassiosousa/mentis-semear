import type {
  Diary,
  DiaryInput,
  DiaryPhotoSlot,
  DiaryUpdate,
} from '@/domain/diary/entities/Diary';
import type { DiaryRepository } from '@/domain/diary/repositories/DiaryRepository';

export class FindWorkshopDiary {
  constructor(private readonly diaries: DiaryRepository) {}

  execute(workshopId: number): Promise<Diary | null> {
    return this.diaries.findByWorkshop(workshopId);
  }
}

export class CreateDiary {
  constructor(private readonly diaries: DiaryRepository) {}

  execute(input: DiaryInput): Promise<Diary> {
    return this.diaries.create(input);
  }
}

export class UpdateDiary {
  constructor(private readonly diaries: DiaryRepository) {}

  execute(id: number, input: DiaryUpdate): Promise<Diary> {
    return this.diaries.update(id, input);
  }
}

export class FetchDiaryPhoto {
  constructor(private readonly diaries: DiaryRepository) {}

  execute(id: number, slot: DiaryPhotoSlot): Promise<Blob> {
    return this.diaries.photo(id, slot);
  }
}
