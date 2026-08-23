import { Outlet, useRouterState } from '@tanstack/react-router';
import { AppFooter } from '@/presentation/components/layout/AppFooter';

const FOOTERLESS_PATHS = ['/login', '/checkin', '/avaliacao'];

export function RootLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const hideFooter = FOOTERLESS_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>

      {!hideFooter && <AppFooter />}
    </div>
  );
}
