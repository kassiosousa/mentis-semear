import { createRootRouteWithContext } from '@tanstack/react-router';
import { RootLayout } from '@/presentation/components/layout/RootLayout';
import { NotFoundPage } from '@/presentation/pages/errors/NotFoundPage';
import { RouteErrorPage } from '@/presentation/pages/errors/RouteErrorPage';
import type { RouterContext } from '@/presentation/routes/routerContext';

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: RouteErrorPage,
});
