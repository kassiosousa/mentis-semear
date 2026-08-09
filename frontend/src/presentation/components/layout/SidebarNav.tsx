import { Link } from '@tanstack/react-router';
import {
  Building2,
  CalendarPlus,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Presentation,
  Settings,
  Sprout,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { User, UserType } from '@/domain/auth/entities/User';
import { labelOfType } from '@/domain/auth/entities/User';
import { BrandMark } from '@/presentation/components/layout/BrandMark';
import { Button } from '@/presentation/components/ui/button';
import { useSignOut } from '@/presentation/hooks/useSignOut';
import { homePathFor } from '@/presentation/routes/guards';

interface NavItem {
  label: string;
  icon: ComponentType<{ className?: string }>;
  to?: string;
  badge?: string;
  exact?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const SEEDS: NavItem = { label: 'Sementes', icon: Sprout, to: '/sementes' };

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Usuários', icon: Users, to: '/admin/usuarios' },
  { label: 'Empresas', icon: Building2, to: '/admin/empresas' },
  { label: 'Oficinas', icon: Presentation, to: '/admin/oficinas' },
];

const FACILITADOR_ITEMS: NavItem[] = [{ label: 'Nova oficina', icon: CalendarPlus }];

function menuItemsFor(type: UserType): NavItem[] {
  const home: NavItem = {
    label: 'Painel',
    icon: LayoutDashboard,
    to: homePathFor(type),
    exact: true,
  };

  if (type === 'admin') return [home, ...ADMIN_ITEMS, SEEDS];
  if (type === 'facilitador') return [home, ...FACILITADOR_ITEMS, SEEDS];

  return [home, SEEDS];
}

function groupsFor(type: UserType): NavGroup[] {
  return [
    { label: 'Menu', items: menuItemsFor(type) },
    {
      label: 'Geral',
      items: [
        { label: 'Configurações', icon: Settings },
        { label: 'Ajuda', icon: CircleHelp },
      ],
    },
  ];
}

const ITEM_BASE =
  'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors';

function NavLinkItem({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const { label, icon: Icon, to, badge, exact = false } = item;

  if (to === undefined) {
    return (
      <span
        aria-disabled
        title="Tela ainda não implementada"
        className={`${ITEM_BASE} cursor-not-allowed text-subtitle/50`}
      >
        <Icon className="size-4.5 shrink-0" />
        <span className="truncate">{label}</span>
        <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Em breve
        </span>
      </span>
    );
  }

  return (
    <Link
      to={to}
      onClick={onNavigate}
      activeOptions={{ exact }}
      className={`${ITEM_BASE} text-subtitle hover:bg-primary-500/8 hover:text-title data-[status=active]:bg-primary-500/10 data-[status=active]:text-title`}
    >
      <span className="absolute top-1/2 -left-3 h-6 w-1 origin-left -translate-y-1/2 scale-x-0 rounded-r-full bg-primary-500 transition-transform group-data-[status=active]:scale-x-100" />
      <Icon className="size-4.5 shrink-0 text-subtitle transition-colors group-data-[status=active]:text-primary-500" />
      <span className="truncate">{label}</span>
      {badge !== undefined && (
        <span className="ml-auto rounded-full bg-primary-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function SidebarNav({ user, onNavigate }: { user: User | null; onNavigate?: () => void }) {
  const signOut = useSignOut();
  const type = user?.type ?? 'usuario';

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-2xl bg-surface p-3 ring-1 ring-foreground/5">
      <div className="px-2 py-3">
        <BrandMark />
      </div>

      <nav className="flex flex-1 flex-col gap-6 py-2">
        {groupsFor(type).map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <span className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              {group.label}
            </span>

            {group.items.map((item) => (
              <NavLinkItem key={item.label} item={item} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-4 rounded-xl bg-secondary-700 p-3 text-white">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-semibold">
            {user === null ? '—' : initialsOf(user.name)}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user?.name ?? '—'}</p>
            <p className="truncate text-xs text-white/70">{labelOfType(type)}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className="mt-3 w-full justify-start bg-white/10 text-white hover:bg-white/20 hover:text-white"
        >
          <LogOut className="size-4" />
          {signOut.isPending ? 'Saindo…' : 'Sair'}
        </Button>
      </div>
    </div>
  );
}
