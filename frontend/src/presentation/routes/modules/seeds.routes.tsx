import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { requireAnyPermission } from '@/presentation/routes/guards';
import { protectedRoute } from '@/presentation/routes/protectedRoute';

export const seedsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/sementes',
  beforeLoad: requireAnyPermission('seeds.view'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/seeds/SeedsPage'),
    'SeedsPage',
  ),
});
