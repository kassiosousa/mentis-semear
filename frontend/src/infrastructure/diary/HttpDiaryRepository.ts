import type {
  Diary,
  DiaryInput,
  DiaryPhotos,
  DiaryPhotoSlot,
  DiaryUpdate,
} from '@/domain/diary/entities/Diary';
import type { DiaryRepository } from '@/domain/diary/repositories/DiaryRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient, HttpRequestOptions } from '@/infrastructure/http/HttpClient';

interface DiaryApiModel {
  id: number;
  workshop_id: number;
  user_creator_id: string;
  title: string;
  description: string;
  datetime: string;
  file_1_url?: string | null;
  file_2_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface Paginated<T> {
  data?: T[];
}

const MULTIPART: HttpRequestOptions = { headers: { 'Content-Type': 'multipart/form-data' } };

function toEntity(model: DiaryApiModel): Diary {
  return {
    id: Number(model.id),
    workshopId: Number(model.workshop_id),
    creatorId: model.user_creator_id,
    title: model.title,
    description: model.description,
    datetime: model.datetime,
    photo1Url: model.file_1_url ?? null,
    photo2Url: model.file_2_url ?? null,
    createdAt: model.created_at ?? null,
    updatedAt: model.updated_at ?? null,
  };
}

function appendPhotos(form: FormData, photos: DiaryPhotos): void {
  if (photos.photo1 !== null) form.append('file_1', photos.photo1);
  if (photos.photo2 !== null) form.append('file_2', photos.photo2);
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
    const form = new FormData();

    form.append('workshop_id', String(input.workshopId));
    form.append('title', input.title);
    form.append('description', input.description);
    form.append('datetime', input.datetime);
    appendPhotos(form, input);

    const payload = await this.http.post<unknown>('/diaries', form, MULTIPART);

    return toEntity(unwrap<DiaryApiModel>(payload));
  }

  async update(id: number, input: DiaryUpdate): Promise<Diary> {
    const form = new FormData();

    form.append('_method', 'PUT');
    form.append('title', input.title);
    form.append('description', input.description);
    form.append('datetime', input.datetime);
    appendPhotos(form, input);

    const payload = await this.http.post<unknown>(`/diaries/${id}`, form, MULTIPART);

    return toEntity(unwrap<DiaryApiModel>(payload));
  }

  photo(id: number, slot: DiaryPhotoSlot): Promise<Blob> {
    return this.http.get<Blob>(`/diaries/${id}/files/${slot}`, { responseType: 'blob' });
  }
}
