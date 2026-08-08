import { Outlet, createRootRouteWithContext } from '@tanstack/react-router';
import { NotFoundPage } from '@/presentation/pages/errors/NotFoundPage';
import { RouteErrorPage } from '@/presentation/pages/errors/RouteErrorPage';
import type { RouterContext } from '@/presentation/routes/routerContext';

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFoundPage,
  errorComponent: RouteErrorPage,
});
