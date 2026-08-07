import { Link, Outlet } from '@tanstack/react-router';
import { LayoutDashboard, LogOut, Sprout } from 'lucide-react';
import type { ComponentType } from 'react';
import type { Permission } from '@/domain/auth/entities/User';
import { Button } from '@/presentation/components/ui/button';
import { Separator } from '@/presentation/components/ui/separator';
import { useCurrentUser, usePermissions } from '@/presentation/hooks/useSession';
import { useSignOut } from '@/presentation/hooks/useSignOut';

interface NavItem {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  permissions?: Permission[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Painel', icon: LayoutDashboard },
  { to: '/sementes', label: 'Sementes', icon: Sprout, permissions: ['seeds.view'] },
];

export function AppLayout() {
  const user = useCurrentUser();
  const { canAny } = usePermissions();
  const signOut = useSignOut();

  const visibleItems = NAV_ITEMS.filter(
    (item) => item.permissions === undefined || canAny(...item.permissions),
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <div className="flex h-14 items-center gap-2 px-4 font-semibold">
          <Sprout className="size-5 text-primary" />
          Mentis Semear
        </div>

        <Separator />

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {visibleItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: 'bg-muted text-foreground font-medium' }}
              activeOptions={{ exact: to === '/' }}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-border px-4 md:px-6">
          <span className="text-sm text-muted-foreground">{user?.email}</span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut.mutate()}
            disabled={signOut.isPending}
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
