import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { requireType } from '@/presentation/routes/guards';
import { protectedRoute } from '@/presentation/routes/protectedRoute';

export const empresaDashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/empresa',
  beforeLoad: requireType('empresa'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/empresa/EmpresaDashboardPage'),
    'EmpresaDashboardPage',
  ),
});

export const empresaSectorsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/empresa/setores',
  beforeLoad: requireType('empresa'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/empresa/SectorsPage'),
    'SectorsPage',
  ),
});

export const empresaSectorDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/empresa/setores/$id',
  beforeLoad: requireType('empresa'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/empresa/SectorDetailPage'),
    'SectorDetailPage',
  ),
});

export const empresaLogsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/empresa/relatorios',
  beforeLoad: requireType('empresa'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/empresa/LogsPage'),
    'LogsPage',
  ),
});
