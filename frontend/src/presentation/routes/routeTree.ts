import {
  adminCompaniesRoute,
  adminCompanyReportRoute,
  adminDashboardRoute,
  adminLogsRoute,
  adminReportsRoute,
  adminSectorDetailRoute,
  adminSectorsRoute,
  adminUsersRoute,
  adminWorkshopsRoute,
  workshopDetailRoute,
} from '@/presentation/routes/modules/admin.routes';
import { forbiddenRoute, loginRoute } from '@/presentation/routes/modules/auth.routes';
import { dashboardRoute } from '@/presentation/routes/modules/dashboard.routes';
import {
  empresaDashboardRoute,
  empresaReportsRoute,
  empresaSectorDetailRoute,
  empresaSectorsRoute,
} from '@/presentation/routes/modules/empresa.routes';
import {
  facilitadorDashboardRoute,
  facilitadorWorkshopRoute,
} from '@/presentation/routes/modules/facilitador.routes';
import {
  assessmentRoute,
  checkInRoute,
  thermometerRoute,
} from '@/presentation/routes/modules/public.routes';
import { protectedRoute } from '@/presentation/routes/protectedRoute';
import { rootRoute } from '@/presentation/routes/rootRoute';

export const routeTree = rootRoute.addChildren([
  loginRoute,
  forbiddenRoute,
  checkInRoute,
  assessmentRoute,
  thermometerRoute,
  protectedRoute.addChildren([
    dashboardRoute,
    adminDashboardRoute,
    adminUsersRoute,
    adminCompaniesRoute,
    adminSectorsRoute,
    adminSectorDetailRoute,
    adminWorkshopsRoute,
    workshopDetailRoute,
    adminReportsRoute,
    adminCompanyReportRoute,
    adminLogsRoute,
    empresaDashboardRoute,
    empresaSectorsRoute,
    empresaSectorDetailRoute,
    empresaReportsRoute,
    facilitadorDashboardRoute,
    facilitadorWorkshopRoute,
  ]),
]);
