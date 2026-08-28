import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { rootRoute } from '@/presentation/routes/rootRoute';

export const checkInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkin/$token',
  component: lazyRouteComponent(
    () => import('@/presentation/pages/public/CheckInPage'),
    'CheckInPage',
  ),
});

export const assessmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/avaliacao/$token',
  component: lazyRouteComponent(
    () => import('@/presentation/pages/public/AssessmentPage'),
    'AssessmentPage',
  ),
});

export interface ThermometerSearch {
  setor?: number;
}

export const thermometerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/termometro/$token',
  validateSearch: (search: Record<string, unknown>): ThermometerSearch => {
    const setor = Number(search.setor);

    return Number.isInteger(setor) && setor > 0 ? { setor } : {};
  },
  component: lazyRouteComponent(
    () => import('@/presentation/pages/public/ThermometerPage'),
    'ThermometerPage',
  ),
});
