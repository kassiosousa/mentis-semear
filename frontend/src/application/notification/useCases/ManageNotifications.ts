import type { Notification } from '@/domain/notification/entities/Notification';
import type {
  NotificationFilters,
  NotificationPage,
  NotificationRepository,
} from '@/domain/notification/repositories/NotificationRepository';

export class ListNotifications {
  constructor(private readonly notifications: NotificationRepository) {}

  execute(filters: NotificationFilters = {}): Promise<NotificationPage> {
    return this.notifications.list(filters);
  }
}

export class CountUnreadNotifications {
  constructor(private readonly notifications: NotificationRepository) {}

  execute(): Promise<number> {
    return this.notifications.unreadCount();
  }
}

export class MarkNotificationRead {
  constructor(private readonly notifications: NotificationRepository) {}

  execute(id: number): Promise<Notification> {
    return this.notifications.updateStatus(id, 'read');
  }
}

export class MarkAllNotificationsRead {
  constructor(private readonly notifications: NotificationRepository) {}

  execute(): Promise<number> {
    return this.notifications.readAll();
  }
}
