import type { UserType } from '@/domain/auth/entities/User';
import type { Notification } from '@/domain/notification/entities/Notification';
import { referenceOf } from '@/domain/notification/entities/Notification';

export type NotificationTarget =
  | { to: '/admin/oficinas/$id'; params: { id: string } }
  | { to: '/facilitador/oficinas/$id'; params: { id: string } }
  | { to: '/admin/oficinas' }
  | { to: '/admin/empresas' }
  | { to: '/admin/usuarios' };

export function targetOf(
  notification: Notification,
  type: UserType | null,
): NotificationTarget | null {
  const reference = referenceOf(notification);
  if (reference === null) return null;

  if (reference.resource === 'workshop') {
    if (type === 'admin') {
      return reference.id === null
        ? { to: '/admin/oficinas' }
        : { to: '/admin/oficinas/$id', params: { id: String(reference.id) } };
    }

    if (type === 'facilitador' && reference.id !== null) {
      return { to: '/facilitador/oficinas/$id', params: { id: String(reference.id) } };
    }

    return null;
  }

  if (type !== 'admin') return null;

  return reference.resource === 'company' ? { to: '/admin/empresas' } : { to: '/admin/usuarios' };
}
