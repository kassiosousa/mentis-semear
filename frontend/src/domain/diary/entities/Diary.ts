export interface Diary {
  id: number;
  workshopId: number;
  creatorId: string;
  title: string;
  description: string;
  datetime: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface DiaryInput {
  workshopId: number;
  title: string;
  description: string;
  datetime: string;
}

export type DiaryUpdate = Omit<DiaryInput, 'workshopId'>;
