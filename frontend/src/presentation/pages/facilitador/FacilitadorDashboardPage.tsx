import { CalendarClock, Plus, Presentation, Ticket } from 'lucide-react';
import { AwaitingApiRow, StatCard } from '@/presentation/components/dashboard/panels';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { Alert, AlertDescription, AlertTitle } from '@/presentation/components/ui/alert';
import { Button } from '@/presentation/components/ui/button';
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

const monthlyQuota: number | null = null;

export function FacilitadorDashboardPage() {
  const user = useCurrentUser();

  const canCreateWorkshop = monthlyQuota !== null && monthlyQuota > 0;
  const blockedReason =
    monthlyQuota === null
      ? 'Cota indisponível — este módulo ainda não tem endpoint na API.'
      : 'A cota de oficinas da sua empresa acabou neste mês.';

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Painel do Facilitador" subtitle={`Bem-vindo, ${user?.name ?? ''}.`}>
        <Button
          size="lg"
          disabled={!canCreateWorkshop}
          title={canCreateWorkshop ? undefined : blockedReason}
        >
          <Plus className="size-4" />
          Nova oficina
        </Button>
      </PageHeading>

      {!canCreateWorkshop && (
        <Alert>
          <Ticket />
          <AlertTitle>Nova oficina indisponível</AlertTitle>
          <AlertDescription>{blockedReason}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Minhas oficinas" value="—" icon={Presentation} />
        <StatCard label="Próximas" value="—" icon={CalendarClock} />
        <StatCard label="Cota disponível no mês" value="—" icon={Ticket} />
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Presentation className="size-4 text-primary" />
            Minhas oficinas
          </CardTitle>
          <CardDescription>Encontros que você facilita.</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" disabled title="Tela ainda não implementada">
              Ver todas
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Data</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Check-ins</TableHead>
                <TableHead className="pr-4">Avaliação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AwaitingApiRow colSpan={4} />
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="size-4 text-primary" />
            Próximas oficinas agendadas
          </CardTitle>
          <CardDescription>Aviso dos encontros mais próximos.</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            Sem dados — este módulo ainda não tem endpoint na API.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
