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

export const adminCompaniesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/admin/empresas',
  beforeLoad: requireType('admin'),
  component: lazyRouteComponent(
    () => import('@/presentation/pages/admin/CompaniesPage'),
    'CompaniesPage',
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
