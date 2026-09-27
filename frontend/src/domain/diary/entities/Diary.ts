export type DiaryPhotoSlot = 1 | 2;

export const DIARY_PHOTO_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;

export const DIARY_PHOTO_ACCEPT = DIARY_PHOTO_TYPES.join(',');

export const DIARY_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

export const DIARY_PHOTO_SLOTS: DiaryPhotoSlot[] = [1, 2];

export interface Diary {
  id: number;
  workshopId: number;
  creatorId: string;
  title: string;
  description: string;
  datetime: string;
  photo1Url: string | null;
  photo2Url: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DiaryPhotos {
  photo1: File | null;
  photo2: File | null;
}

export interface DiaryInput extends DiaryPhotos {
  workshopId: number;
  title: string;
  description: string;
  datetime: string;
}

export type DiaryUpdate = Omit<DiaryInput, 'workshopId'>;

export function photoUrlOf(diary: Diary | null, slot: DiaryPhotoSlot): string | null {
  if (diary === null) return null;

  return slot === 1 ? diary.photo1Url : diary.photo2Url;
}

export function photoRejection(file: File): string | null {
  if (!(DIARY_PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return 'Envie um arquivo JPEG, PNG ou PDF.';
  }

  if (file.size > DIARY_PHOTO_MAX_BYTES) {
    return 'O arquivo precisa ter no máximo 5 MB.';
  }

  return null;
}
