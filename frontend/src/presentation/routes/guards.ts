import { redirect } from '@tanstack/react-router';
import type { AuthSession } from '@/domain/auth/entities/AuthSession';
import type { UserType } from '@/domain/auth/entities/User';
import { hasType } from '@/domain/auth/entities/User';
import type { RouterContext } from '@/presentation/routes/routerContext';

export interface GuardArgs {
  context: RouterContext;
  location: { href: string };
}

export interface AuthenticatedContext {
  session: AuthSession;
}

export type RouteGuard = (args: GuardArgs) => Promise<AuthenticatedContext>;

export type HomePath = '/admin' | '/facilitador' | '/empresa' | '/';

export function homePathFor(type: UserType): HomePath {
  if (type === 'admin') return '/admin';
  if (type === 'facilitador') return '/facilitador';
  if (type === 'empresa') return '/empresa';

  return '/';
}

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
    throw redirect({ to: homePathFor(session.user.type) });
  }
}

export function requireType(...types: UserType[]): RouteGuard {
  return async (args) => {
    const { session } = await requireAuth(args);

    if (!hasType(session.user, ...types)) {
      throw redirect({ to: '/sem-permissao' });
    }

    return { session };
  };
}

export function redirectToOwnPanel({ context }: { context: AuthenticatedContext }): void {
  const path = homePathFor(context.session.user.type);

  if (path !== '/') {
    throw redirect({ to: path });
  }
}
