import type {
  Notification,
  NotificationStatus,
} from '@/domain/notification/entities/Notification';
import { isNotificationStatus } from '@/domain/notification/entities/Notification';
import type {
  NotificationFilters,
  NotificationPage,
  NotificationRepository,
} from '@/domain/notification/repositories/NotificationRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

interface NotificationApiModel {
  id: number;
  title?: string | null;
  message?: string | null;
  event?: string | null;
  status?: string | null;
  read_at?: string | null;
  created_at?: string | null;
}

interface NotificationsApiPage {
  data?: NotificationApiModel[];
  current_page?: number;
  per_page?: number | string;
  last_page?: number;
  total?: number;
}

function toEntity(model: NotificationApiModel): Notification {
  return {
    id: model.id,
    title: model.title ?? '',
    message: model.message ?? '',
    event: model.event ?? null,
    status: isNotificationStatus(model.status) ? model.status : 'new',
    readAt: model.read_at ?? null,
    createdAt: model.created_at ?? null,
  };
}

function lastPageOf(total: number, perPage: number, reported?: number): number {
  if (reported != null && reported > 0) return reported;

  return perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
}

export class HttpNotificationRepository implements NotificationRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filters: NotificationFilters = {}): Promise<NotificationPage> {
    const payload = await this.http.get<NotificationsApiPage | NotificationApiModel[]>(
      '/notifications',
      { params: { status: filters.status, page: filters.page } },
    );

    if (Array.isArray(payload)) {
      return {
        notifications: payload.map(toEntity),
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
      notifications: models.map(toEntity),
      currentPage: payload.current_page ?? 1,
      perPage,
      lastPage: lastPageOf(total, perPage, payload.last_page),
      total,
    };
  }

  async unreadCount(): Promise<number> {
    const payload = await this.http.get<unknown>('/notifications/unread-count');

    return Number(unwrap<{ unread?: number }>(payload).unread ?? 0);
  }

  async updateStatus(id: number, status: NotificationStatus): Promise<Notification> {
    const payload = await this.http.patch<unknown>(`/notifications/${id}`, { status });

    return toEntity(unwrap<NotificationApiModel>(payload));
  }

  async readAll(): Promise<number> {
    const payload = await this.http.post<unknown>('/notifications/read-all');

    return Number(unwrap<{ updated?: number }>(payload).updated ?? 0);
  }
}
