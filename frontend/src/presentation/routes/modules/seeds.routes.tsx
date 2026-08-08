import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { requireAuth } from '@/presentation/routes/guards';
import { protectedRoute } from '@/presentation/routes/protectedRoute';

export const seedsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/sementes',
  beforeLoad: requireAuth,
  component: lazyRouteComponent(
    () => import('@/presentation/pages/seeds/SeedsPage'),
    'SeedsPage',
  ),
});
