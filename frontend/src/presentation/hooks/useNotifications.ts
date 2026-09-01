import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import type { Notification } from '@/domain/notification/entities/Notification';
import type { NotificationPage } from '@/domain/notification/repositories/NotificationRepository';
import { container } from '@/presentation/container';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unread: () => [...notificationKeys.all, 'unread'] as const,
};

type NotificationList = InfiniteData<NotificationPage, number>;

function mapList(
  list: NotificationList | undefined,
  update: (notification: Notification) => Notification,
): NotificationList | undefined {
  if (list === undefined) return list;

  return {
    ...list,
    pages: list.pages.map((page) => ({
      ...page,
      notifications: page.notifications.map(update),
    })),
  };
}

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) => container.notifications.list.execute({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (page) =>
      page.currentPage < page.lastPage ? page.currentPage + 1 : undefined,
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => container.notifications.unreadCount.execute(),
    meta: { silentError: true },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => container.notifications.markRead.execute(id),
    onSuccess: (updated) => {
      queryClient.setQueryData<NotificationList>(notificationKeys.list(), (list) =>
        mapList(list, (item) => (item.id === updated.id ? updated : item)),
      );
      queryClient.setQueryData<number>(notificationKeys.unread(), (count) =>
        Math.max(0, (count ?? 1) - 1),
      );
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => container.notifications.readAll.execute(),
    onSuccess: () => {
      const readAt = new Date().toISOString();

      queryClient.setQueryData<NotificationList>(notificationKeys.list(), (list) =>
        mapList(list, (item) =>
          item.status === 'read' ? item : { ...item, status: 'read', readAt },
        ),
      );
      queryClient.setQueryData<number>(notificationKeys.unread(), 0);
    },
  });
}
