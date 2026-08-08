import type { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { container } from '@/presentation/container';
import { routeTree } from '@/presentation/routes/routeTree';

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: { container, queryClient },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
