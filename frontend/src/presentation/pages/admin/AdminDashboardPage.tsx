import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarClock,
  HeartHandshake,
  Presentation,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import {
  AwaitingApiBlock,
  AwaitingApiRow,
  StatCard,
} from '@/presentation/components/dashboard/panels';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { useCurrentUser } from '@/presentation/hooks/useSession';

interface Shortcut {
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  to?: string;
}

const SHORTCUTS: Shortcut[] = [
  {
    label: 'Usuários',
    description: 'Cadastros, perfis e aprovações',
    icon: Users,
    to: '/admin/usuarios',
  },
  {
    label: 'Empresas',
    description: 'Organizações parceiras',
    icon: Building2,
    to: '/admin/empresas',
  },
  { label: 'Oficinas', description: 'Agenda e histórico', icon: Presentation },
];

export function AdminDashboardPage() {
  const user = useCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Painel do Administrador" subtitle={`Bem-vindo, ${user?.name ?? ''}.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Empresas" value="—" icon={Building2} />
        <StatCard label="Usuários" value="—" icon={Users} />
        <StatCard label="Oficinas" value="—" icon={Presentation} />
        <StatCard label="Pessoas alcançadas" value="—" icon={HeartHandshake} />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Solicitações de acesso
          </CardTitle>
          <CardDescription>Cadastros aguardando permissão para entrar.</CardDescription>
          <CardAction>
            <Badge variant="secondary">—</Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Solicitado em</TableHead>
                <TableHead className="pr-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AwaitingApiRow colSpan={5} />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="size-4 text-primary" />
              Últimas oficinas realizadas
            </CardTitle>
            <CardDescription>Encontros já concluídos.</CardDescription>
          </CardHeader>

          <CardContent>
            <AwaitingApiBlock>
              Sem dados — este módulo ainda não tem endpoint na API.
            </AwaitingApiBlock>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" />
              Próximas oficinas
            </CardTitle>
            <CardDescription>Encontros agendados.</CardDescription>
          </CardHeader>

          <CardContent>
            <AwaitingApiBlock>
              Sem dados — este módulo ainda não tem endpoint na API.
            </AwaitingApiBlock>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Atalhos</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SHORTCUTS.map(({ label, description, icon: Icon, to }) => {
            const body = (
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  {label}
                  <ArrowRight className="ml-auto size-4 text-muted-foreground" />
                </CardTitle>
                <CardDescription>{description}</CardDescription>
                {to === undefined && (
                  <span className="mt-1 text-xs text-muted-foreground">Em breve</span>
                )}
              </CardHeader>
            );

            if (to === undefined) {
              return (
                <Card
                  key={label}
                  size="sm"
                  aria-disabled
                  className="border border-dashed border-border opacity-60 ring-0"
                  title="Tela ainda não implementada"
                >
                  {body}
                </Card>
              );
            }

            return (
              <Link key={label} to={to} className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <Card
                  size="sm"
                  className="h-full transition-colors hover:bg-primary-500/5 hover:ring-primary-500/30"
                >
                  {body}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
