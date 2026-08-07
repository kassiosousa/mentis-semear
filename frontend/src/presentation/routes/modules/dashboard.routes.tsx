import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { protectedRoute } from '@/presentation/routes/protectedRoute';

export const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  component: lazyRouteComponent(
    () => import('@/presentation/pages/dashboard/DashboardPage'),
    'DashboardPage',
  ),
});
