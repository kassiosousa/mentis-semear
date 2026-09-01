import { Bell, BookOpen, Building2, Sprout, UserPlus, UserRoundCheck } from 'lucide-react';
import type { ComponentType } from 'react';
import type { NotificationEvent } from '@/domain/notification/entities/Notification';
import { isNotificationEvent } from '@/domain/notification/entities/Notification';

export interface NotificationStyle {
  icon: ComponentType<{ className?: string }>;
  className: string;
}

const STYLES: Record<NotificationEvent, NotificationStyle> = {
  'workshop.created': { icon: Sprout, className: 'bg-primary-500/12 text-primary-500' },
  'workshop.assigned': {
    icon: UserRoundCheck,
    className: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400',
  },
  'diary.created': {
    icon: BookOpen,
    className: 'bg-amber-500/12 text-amber-600 dark:text-amber-400',
  },
  'company.created': {
    icon: Building2,
    className: 'bg-sky-500/12 text-sky-600 dark:text-sky-400',
  },
  'user.created': {
    icon: UserPlus,
    className: 'bg-violet-500/12 text-violet-600 dark:text-violet-400',
  },
};

const FALLBACK: NotificationStyle = { icon: Bell, className: 'bg-muted text-muted-foreground' };

export function styleOfEvent(event: string | null): NotificationStyle {
  return isNotificationEvent(event) ? STYLES[event] : FALLBACK;
}

export function relativeTime(iso: string | null): string {
  if (iso === null) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} d`;

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}
