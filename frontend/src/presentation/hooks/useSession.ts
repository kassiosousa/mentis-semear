import { useCallback, useSyncExternalStore } from 'react';
import type { AuthSession } from '@/domain/auth/entities/AuthSession';
import type { UserType } from '@/domain/auth/entities/User';
import { hasType } from '@/domain/auth/entities/User';
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

export function useUserType(): UserType | null {
  return useCurrentUser()?.type ?? null;
}

export function useIsType(...types: UserType[]): boolean {
  const user = useCurrentUser();

  return user === null ? false : hasType(user, ...types);
}
