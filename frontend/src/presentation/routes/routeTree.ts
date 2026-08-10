import {
  adminCompaniesRoute,
  adminDashboardRoute,
  adminUsersRoute,
  adminWorkshopsRoute,
  workshopDetailRoute,
} from '@/presentation/routes/modules/admin.routes';
import { forbiddenRoute, loginRoute } from '@/presentation/routes/modules/auth.routes';
import { dashboardRoute } from '@/presentation/routes/modules/dashboard.routes';
import {
  facilitadorDashboardRoute,
  facilitadorWorkshopRoute,
} from '@/presentation/routes/modules/facilitador.routes';
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
    adminWorkshopsRoute,
    workshopDetailRoute,
    facilitadorDashboardRoute,
    facilitadorWorkshopRoute,
  ]),
]);
