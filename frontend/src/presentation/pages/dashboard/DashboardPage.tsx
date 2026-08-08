import { CalendarClock, Presentation, Sprout } from 'lucide-react';
import { AwaitingApiBlock, StatCard } from '@/presentation/components/dashboard/panels';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card';
import { useCurrentUser } from '@/presentation/hooks/useSession';

export function DashboardPage() {
  const user = useCurrentUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Painel" subtitle={`Bem-vindo, ${user?.name ?? ''}.`} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Oficinas participadas" value="—" icon={Presentation} />
        <StatCard label="Próximos encontros" value="—" icon={CalendarClock} />
        <StatCard label="Sementes plantadas" value="—" icon={Sprout} />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            Próximos encontros
          </CardTitle>
          <CardDescription>Oficinas em que você está inscrito.</CardDescription>
        </CardHeader>

        <CardContent>
          <AwaitingApiBlock>
            Sem dados.
          </AwaitingApiBlock>
        </CardContent>
      </Card>
    </div>
  );
}
