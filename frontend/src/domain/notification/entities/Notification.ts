export const NOTIFICATION_STATUSES = ['new', 'read'] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export const NOTIFICATION_EVENTS = [
  'workshop.created',
  'workshop.assigned',
  'diary.created',
  'company.created',
  'user.created',
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export type NotificationResource = 'workshop' | 'company' | 'user';

export interface Notification {
  id: number;
  title: string;
  message: string;
  event: string | null;
  status: NotificationStatus;
  readAt: string | null;
  createdAt: string | null;
}

export interface NotificationReference {
  resource: NotificationResource;
  id: number | null;
}

export const NOTIFICATION_EVENT_LABELS: Record<NotificationEvent, string> = {
  'workshop.created': 'Oficinas',
  'workshop.assigned': 'Atribuições',
  'diary.created': 'Diários',
  'company.created': 'Empresas',
  'user.created': 'Usuários',
};

const EVENT_RESOURCES: Record<NotificationEvent, NotificationResource> = {
  'workshop.created': 'workshop',
  'workshop.assigned': 'workshop',
  'diary.created': 'workshop',
  'company.created': 'company',
  'user.created': 'user',
};

const REFERENCE_ID = /#(\d+)/;

export function isNotificationStatus(value: unknown): value is NotificationStatus {
  return NOTIFICATION_STATUSES.includes(value as NotificationStatus);
}

export function isNotificationEvent(value: unknown): value is NotificationEvent {
  return NOTIFICATION_EVENTS.includes(value as NotificationEvent);
}

export function isUnread(notification: Notification): boolean {
  return notification.status === 'new';
}

export function labelOfEvent(event: string | null): string {
  return isNotificationEvent(event) ? NOTIFICATION_EVENT_LABELS[event] : 'Geral';
}

export function referenceOf(notification: Notification): NotificationReference | null {
  if (!isNotificationEvent(notification.event)) return null;

  const match = REFERENCE_ID.exec(notification.message);

  return {
    resource: EVENT_RESOURCES[notification.event],
    id: match?.[1] === undefined ? null : Number(match[1]),
  };
}
