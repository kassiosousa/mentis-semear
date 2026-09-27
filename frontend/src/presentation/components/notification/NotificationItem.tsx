import { Check } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import type { Notification } from '@/domain/notification/entities/Notification';
import { isUnread } from '@/domain/notification/entities/Notification';
import {
  relativeTime,
  styleOfEvent,
} from '@/presentation/components/notification/notificationStyle';

interface NotificationItemProps {
  notification: Notification;
  clickable: boolean;
  onOpen: (notification: Notification) => void;
  onMarkRead: (notification: Notification) => void;
}

export function NotificationItem({
  notification,
  clickable,
  onOpen,
  onMarkRead,
}: NotificationItemProps) {
  const unread = isUnread(notification);
  const { icon: Icon, className } = styleOfEvent(notification.event);

  const openOnKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    onOpen(notification);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(notification)}
      onKeyDown={openOnKey}
      className={`flex w-full items-start gap-3 px-4 py-3 text-left outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset ${
        clickable ? 'cursor-pointer hover:bg-muted/60' : 'cursor-default'
      } ${unread ? 'bg-primary-500/5' : ''}`}
    >
      <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full ${className}`}>
        <Icon className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${
            unread ? 'font-semibold text-title' : 'font-medium text-subtitle'
          }`}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          {relativeTime(notification.createdAt)}
        </p>
      </div>

      {unread && (
        <button
          type="button"
          title="Marcar como lida"
          aria-label="Marcar como lida"
          onClick={(event) => {
            event.stopPropagation();
            onMarkRead(notification);
          }}
          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-primary-500 transition-colors outline-none hover:bg-primary-500/12 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Check className="size-3.5" />
        </button>
      )}
    </div>
  );
}
