import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { redirectToOwnPanel } from '@/presentation/routes/guards';
import { protectedRoute } from '@/presentation/routes/protectedRoute';

export const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/',
  beforeLoad: redirectToOwnPanel,
  component: lazyRouteComponent(
    () => import('@/presentation/pages/dashboard/DashboardPage'),
    'DashboardPage',
  ),
});
