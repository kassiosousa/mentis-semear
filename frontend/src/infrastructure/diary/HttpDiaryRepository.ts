import type { Diary, DiaryInput, DiaryUpdate } from '@/domain/diary/entities/Diary';
import type { DiaryRepository } from '@/domain/diary/repositories/DiaryRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface DiaryApiModel {
  id: number;
  workshop_id: number;
  user_creator_id: string;
  title: string;
  description: string;
  datetime: string;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Paginated<T> {
  data?: T[];
}

function toEntity(model: DiaryApiModel): Diary {
  return {
    id: model.id,
    workshopId: model.workshop_id,
    creatorId: model.user_creator_id,
    title: model.title,
    description: model.description,
    datetime: model.datetime,
    createdAt: model.created_at ?? null,
    updatedAt: model.updated_at ?? null,
  };
}

export class HttpDiaryRepository implements DiaryRepository {
  constructor(private readonly http: HttpClient) {}

  async findByWorkshop(workshopId: number): Promise<Diary | null> {
    const payload = await this.http.get<Paginated<DiaryApiModel> | DiaryApiModel[]>('/diaries', {
      params: { workshop_id: workshopId },
    });

    const rows = Array.isArray(payload) ? payload : (payload.data ?? []);
    const found = rows.find((model) => model.workshop_id === workshopId) ?? rows[0];

    return found === undefined ? null : toEntity(found);
  }

  async create(input: DiaryInput): Promise<Diary> {
    const payload = await this.http.post<unknown>('/diaries', {
      workshop_id: input.workshopId,
      title: input.title,
      description: input.description,
      datetime: input.datetime,
    });

    return toEntity(unwrap<DiaryApiModel>(payload));
  }

  async update(id: number, input: DiaryUpdate): Promise<Diary> {
    const payload = await this.http.put<unknown>(`/diaries/${id}`, {
      title: input.title,
      description: input.description,
      datetime: input.datetime,
    });

    return toEntity(unwrap<DiaryApiModel>(payload));
  }
}
