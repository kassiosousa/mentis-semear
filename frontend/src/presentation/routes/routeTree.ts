import {
  adminCompaniesRoute,
  adminDashboardRoute,
  adminUsersRoute,
} from '@/presentation/routes/modules/admin.routes';
import { forbiddenRoute, loginRoute } from '@/presentation/routes/modules/auth.routes';
import { dashboardRoute } from '@/presentation/routes/modules/dashboard.routes';
import { facilitadorDashboardRoute } from '@/presentation/routes/modules/facilitador.routes';
import { seedsRoute } from '@/presentation/routes/modules/seeds.routes';
import { protectedRoute } from '@/presentation/routes/protectedRoute';
import { rootRoute } from '@/presentation/routes/rootRoute';

export const routeTree = rootRoute.addChildren([
  loginRoute,
  forbiddenRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    adminDashboardRoute,
    adminUsersRoute,
    adminCompaniesRoute,
    facilitadorDashboardRoute,
    seedsRoute,
  ]),
]);
