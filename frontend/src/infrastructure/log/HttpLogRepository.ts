import type { Log } from '@/domain/log/entities/Log';
import type { LogFilters, LogPage, LogRepository } from '@/domain/log/repositories/LogRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface LogApiModel {
  id: number;
  description?: string | null;
  user_id?: string | null;
  created_at?: string | null;
}

interface LogsApiPage {
  data?: LogApiModel[];
  current_page?: number;
  per_page?: number | string;
  last_page?: number;
  total?: number;
}

function toEntity(model: LogApiModel): Log {
  return {
    id: model.id,
    description: model.description ?? '',
    userId: model.user_id ?? null,
    createdAt: model.created_at ?? null,
  };
}

function lastPageOf(total: number, perPage: number, reported?: number): number {
  if (reported != null && reported > 0) return reported;

  return perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
}

export class HttpLogRepository implements LogRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filters: LogFilters = {}): Promise<LogPage> {
    const payload = await this.http.get<LogsApiPage | LogApiModel[]>('/logs', {
      params: {
        user_id: filters.userId,
        page: filters.page,
        per_page: filters.perPage,
      },
    });

    if (Array.isArray(payload)) {
      return {
        logs: payload.map(toEntity),
        currentPage: 1,
        perPage: payload.length,
        lastPage: 1,
        total: payload.length,
      };
    }

    const models = payload.data ?? [];
    const perPage = Number(payload.per_page ?? models.length);
    const total = payload.total ?? models.length;

    return {
      logs: models.map(toEntity),
      currentPage: payload.current_page ?? 1,
      perPage,
      lastPage: lastPageOf(total, perPage, payload.last_page),
      total,
    };
  }

  async find(id: number): Promise<Log> {
    const payload = await this.http.get<unknown>(`/logs/${id}`);

    return toEntity(unwrap<LogApiModel>(payload));
  }
}
