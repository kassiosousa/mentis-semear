import { createRoute } from '@tanstack/react-router';
import { SignInPage } from '@/presentation/pages/auth/SignInPage';
import { ForbiddenPage } from '@/presentation/pages/errors/ForbiddenPage';
import { requireGuest } from '@/presentation/routes/guards';
import { rootRoute } from '@/presentation/routes/rootRoute';

export interface LoginSearch {
  redirect?: string;
}

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: requireGuest,
  component: SignInPage,
});

export const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sem-permissao',
  component: ForbiddenPage,
});
