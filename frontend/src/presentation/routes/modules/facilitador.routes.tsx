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

export const facilitadorReportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/facilitador/relatorios',
  beforeLoad: requireType('facilitador'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/facilitador/ReportsPage'),
    'ReportsPage',
  ),
});

export const facilitadorWorkshopRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/facilitador/oficinas/$id',
  beforeLoad: requireType('facilitador'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/facilitador/WorkshopDetailPage'),
    'WorkshopDetailPage',
  ),
});
