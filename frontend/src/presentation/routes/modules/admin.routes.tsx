import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { requireType } from '@/presentation/routes/guards';
import { protectedRoute } from '@/presentation/routes/protectedRoute';

export const adminDashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/AdminDashboardPage'),
    'AdminDashboardPage',
  ),
});

export const adminWorkshopsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/oficinas',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/WorkshopsPage'),
    'WorkshopsPage',
  ),
});

export const workshopDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/oficinas/$id',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/WorkshopDetailPage'),
    'WorkshopDetailPage',
  ),
});

export const adminCompaniesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/empresas',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/CompaniesPage'),
    'CompaniesPage',
  ),
});

export const adminSectorsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/setores',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/SectorsPage'),
    'SectorsPage',
  ),
});

export const adminSectorDetailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/setores/$id',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/SectorDetailPage'),
    'SectorDetailPage',
  ),
});

export const adminUsersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/usuarios',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/UsersPage'),
    'UsersPage',
  ),
});

export const adminCompanyReportRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/relatorios/empresas/$id',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/CompanyReportPage'),
    'CompanyReportPage',
  ),
});

export const adminReportsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/relatorios',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/ReportsPage'),
    'ReportsPage',
  ),
});

export const adminLogsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/logs',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(() => import('@/presentation/pages/admin/LogsPage'), 'LogsPage'),
});
