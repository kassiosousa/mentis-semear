import { redirect } from '@tanstack/react-router';
import type { AuthSession } from '@/domain/auth/entities/AuthSession';
import type { Permission, RoleName } from '@/domain/auth/entities/User';
import { hasAllPermissions, hasAnyPermission, hasRole } from '@/domain/auth/entities/User';
import type { RouterContext } from '@/presentation/routes/routerContext';

export interface GuardArgs {
  context: RouterContext;
  location: { href: string };
}

export interface AuthenticatedContext {
  session: AuthSession;
}

export type RouteGuard = (args: GuardArgs) => Promise<AuthenticatedContext>;

export async function requireAuth({
  context,
  location,
}: GuardArgs): Promise<AuthenticatedContext> {
  const session = await context.container.auth.restoreSession.execute();

  if (session === null) {
    throw redirect({ to: '/login', search: { redirect: location.href } });
  }

  return { session };
}

export async function requireGuest({ context }: GuardArgs): Promise<void> {
  const session = await context.container.auth.restoreSession.execute();

  if (session !== null) {
    throw redirect({ to: '/' });
  }
}

export function requirePermissions(...permissions: Permission[]): RouteGuard {
  return async (args) => {
    const { session } = await requireAuth(args);

    if (!hasAllPermissions(session.user, permissions)) {
      throw redirect({ to: '/sem-permissao' });
    }

    return { session };
  };
}

export function requireAnyPermission(...permissions: Permission[]): RouteGuard {
  return async (args) => {
    const { session } = await requireAuth(args);

    if (!hasAnyPermission(session.user, permissions)) {
      throw redirect({ to: '/sem-permissao' });
    }

    return { session };
  };
}

export function requireRole(role: RoleName): RouteGuard {
  return async (args) => {
    const { session } = await requireAuth(args);

    if (!hasRole(session.user, role)) {
      throw redirect({ to: '/sem-permissao' });
    }

    return { session };
  };
}
