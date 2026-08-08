import { createRoute } from '@tanstack/react-router';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { requireAuth } from '@/presentation/routes/guards';
import { rootRoute } from '@/presentation/routes/rootRoute';

export const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  beforeLoad: requireAuth,
  component: AppLayout,
});
