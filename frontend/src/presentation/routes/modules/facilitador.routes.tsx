import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { requireType } from '@/presentation/routes/guards';
import { protectedRoute } from '@/presentation/routes/protectedRoute';

export const facilitadorDashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/facilitador',
  beforeLoad: requireType('facilitador'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/facilitador/FacilitadorDashboardPage'),
    'FacilitadorDashboardPage',
  ),
});
