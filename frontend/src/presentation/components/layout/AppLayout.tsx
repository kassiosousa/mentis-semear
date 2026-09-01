import { Outlet } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { AppFooter } from '@/presentation/components/layout/AppFooter';
import { BrandMark } from '@/presentation/components/layout/BrandMark';
import { SidebarNav } from '@/presentation/components/layout/SidebarNav';
import { NotificationsBell } from '@/presentation/components/notification/NotificationsBell';
import { Sheet, SheetContent, SheetTrigger } from '@/presentation/components/ui/sheet';
import { useCurrentUser } from '@/presentation/hooks/useSession';

export function AppLayout() {
  const user = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col bg-muted text-foreground">
      <div className="flex flex-1 gap-4 p-3 sm:p-4">
        <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] w-64 shrink-0 lg:block">
          <SidebarNav user={user} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="sticky top-3 z-30 flex h-14 shrink-0 items-center gap-2 rounded-2xl bg-surface px-3 ring-1 ring-foreground/5 sm:top-4 lg:hidden">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                aria-label="Abrir menu"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-subtitle transition-colors outline-none hover:bg-muted hover:text-title focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Menu className="size-5" />
              </SheetTrigger>

              <SheetContent side="left" title="Menu de navegação" className="bg-muted p-2">
                <SidebarNav user={user} onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <BrandMark className="min-w-0" />

            <NotificationsBell className="ml-auto" />
          </header>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>

          <AppFooter className="rounded-2xl border-t-0 ring-1 ring-foreground/5" />
        </div>
      </div>
    </div>
  );
}
