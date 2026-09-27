import { useNavigate } from '@tanstack/react-router';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Notification } from '@/domain/notification/entities/Notification';
import { isUnread, labelOfEvent } from '@/domain/notification/entities/Notification';
import { NotificationItem } from '@/presentation/components/notification/NotificationItem';
import type { NotificationTarget } from '@/presentation/components/notification/notificationTarget';
import { targetOf } from '@/presentation/components/notification/notificationTarget';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/presentation/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotifications,
} from '@/presentation/hooks/useNotifications';
import { useUserType } from '@/presentation/hooks/useSession';

const ALL = 'todos';

type ReadFilter = 'all' | 'unread' | 'read';

const READ_FILTERS: { value: ReadFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'Não lidas' },
  { value: 'read', label: 'Lidas' },
];

function keepOpenOverSelect(event: { detail: { originalEvent: Event }; preventDefault: () => void }) {
  const target = event.detail.originalEvent.target as HTMLElement | null;

  if (target?.closest('[data-slot="select-content"]') != null) {
    event.preventDefault();
  }
}

export function NotificationsBell({ className }: { className?: string }) {
  const userType = useUserType();
  const navigate = useNavigate();

  const query = useNotifications();
  const unreadQuery = useUnreadNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const [isOpen, setIsOpen] = useState(false);
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [eventFilter, setEventFilter] = useState(ALL);

  const notifications = useMemo(
    () => query.data?.pages.flatMap((page) => page.notifications) ?? [],
    [query.data],
  );

  const unread = unreadQuery.data ?? notifications.filter(isUnread).length;

  const eventOptions = useMemo(() => {
    const labels = new Map<string, string>();

    for (const notification of notifications) {
      if (notification.event === null) continue;
      labels.set(notification.event, labelOfEvent(notification.event));
    }

    return [...labels].map(([value, label]) => ({ value, label }));
  }, [notifications]);

  const visible = useMemo(
    () =>
      notifications.filter((notification) => {
        if (readFilter === 'unread' && !isUnread(notification)) return false;
        if (readFilter === 'read' && isUnread(notification)) return false;

        return eventFilter === ALL || notification.event === eventFilter;
      }),
    [notifications, readFilter, eventFilter],
  );

  const goTo = (target: NotificationTarget) => {
    switch (target.to) {
      case '/admin/oficinas/$id':
        navigate({ to: '/admin/oficinas/$id', params: target.params });
        break;
      case '/facilitador/oficinas/$id':
        navigate({ to: '/facilitador/oficinas/$id', params: target.params });
        break;
      case '/admin/oficinas':
        navigate({ to: '/admin/oficinas' });
        break;
      case '/admin/empresas':
        navigate({ to: '/admin/empresas' });
        break;
      case '/admin/usuarios':
        navigate({ to: '/admin/usuarios' });
        break;
    }
  };

  const markAsRead = (notification: Notification) => {
    if (!isUnread(notification)) return;

    markRead.mutate(notification.id, {
      onError: (error) => {
        toast.error(error.message, { id: 'notification-read' });
      },
    });
  };

  const openNotification = (notification: Notification) => {
    markAsRead(notification);

    const target = targetOf(notification, userType);
    if (target !== null) goTo(target);

    setIsOpen(false);
  };

  const markEveryAsRead = () => {
    markAll.mutate(undefined, {
      onSuccess: (updated) => {
        toast.success(
          updated === 1
            ? '1 notificação marcada como lida.'
            : `${updated} notificações marcadas como lidas.`,
          { id: 'notification-read-all' },
        );
      },
      onError: (error) => {
        toast.error(error.message, { id: 'notification-read-all' });
      },
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        aria-label="Notificações"
        className={cn(
          'relative grid size-10 shrink-0 place-items-center rounded-full bg-surface text-subtitle shadow-sm ring-1 ring-foreground/5 transition-colors outline-none hover:bg-muted hover:text-title focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-muted data-[state=open]:text-title',
          className,
        )}
      >
        <Bell className="size-5" />

        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        onPointerDownOutside={keepOpenOverSelect}
        onFocusOutside={keepOpenOverSelect}
        className="w-104 max-w-[calc(100vw-1.5rem)]"
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <h3 className="text-sm font-semibold text-title">Notificações</h3>

          <button
            type="button"
            onClick={markEveryAsRead}
            disabled={unread === 0 || markAll.isPending}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary-500 transition-colors outline-none hover:underline focus-visible:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" />
            {markAll.isPending ? 'Marcando…' : 'Marcar todas como lidas'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pb-3">
          <div className="inline-flex shrink-0 items-center rounded-lg bg-muted p-0.5 text-xs">
            {READ_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setReadFilter(option.value)}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium whitespace-nowrap transition-colors outline-none ${
                  readFilter === option.value
                    ? 'bg-surface text-title shadow-sm'
                    : 'text-muted-foreground hover:text-title'
                }`}
              >
                {option.label}
                {option.value === 'unread' && unread > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] leading-none font-semibold text-white">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="h-8 w-36 shrink-0 text-xs">
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os tipos</SelectItem>
              {eventOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="max-h-105 divide-y divide-border overflow-y-auto border-t border-border">
          {query.isPending &&
            READ_FILTERS.map((option) => (
              <div key={option.value} className="flex items-start gap-3 px-4 py-3">
                <Skeleton className="size-9 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}

          {query.isError && (
            <p className="px-4 py-10 text-center text-sm text-destructive">{query.error.message}</p>
          )}

          {query.isSuccess && visible.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
              <BellOff className="size-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação por aqui.</p>
            </div>
          )}

          {visible.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              clickable={targetOf(notification, userType) !== null}
              onOpen={openNotification}
              onMarkRead={markAsRead}
            />
          ))}

          {query.hasNextPage && (
            <button
              type="button"
              onClick={() => void query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="w-full px-4 py-2.5 text-xs font-medium text-subtitle transition-colors outline-none hover:bg-muted/60 disabled:opacity-50"
            >
              {query.isFetchingNextPage ? 'Carregando…' : 'Carregar mais'}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
