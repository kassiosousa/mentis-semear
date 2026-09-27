import type {
  Notification,
  NotificationStatus,
} from '@/domain/notification/entities/Notification';

export interface NotificationFilters {
  status?: NotificationStatus;
  page?: number;
}

export interface NotificationPage {
  notifications: Notification[];
  currentPage: number;
  perPage: number;
  lastPage: number;
  total: number;
}

export interface NotificationRepository {
  list(filters?: NotificationFilters): Promise<NotificationPage>;
  unreadCount(): Promise<number>;
  updateStatus(id: number, status: NotificationStatus): Promise<Notification>;
  readAll(): Promise<number>;
}
