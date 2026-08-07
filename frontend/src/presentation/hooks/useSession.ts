import { useCallback, useSyncExternalStore } from 'react';
import type { AuthSession } from '@/domain/auth/entities/AuthSession';
import type { Permission, RoleName } from '@/domain/auth/entities/User';
import { hasAnyPermission, hasPermission, hasRole } from '@/domain/auth/entities/User';
import { container } from '@/presentation/container';

export function useSession(): AuthSession | null {
  return useSyncExternalStore(
    useCallback((listener) => container.sessions.subscribe(listener), []),
    () => container.sessions.read(),
  );
}

export function useCurrentUser() {
  return useSession()?.user ?? null;
}

export function usePermissions() {
  const user = useCurrentUser();

  return {
    can: (permission: Permission) => (user === null ? false : hasPermission(user, permission)),
    canAny: (...permissions: Permission[]) =>
      user === null ? false : hasAnyPermission(user, permissions),
    is: (role: RoleName) => (user === null ? false : hasRole(user, role)),
  };
}
