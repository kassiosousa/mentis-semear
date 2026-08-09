import { Link } from '@tanstack/react-router';
import { ArrowRight, ChevronLeft, ChevronRight, FilterX } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Workshop } from '@/domain/workshop/entities/Workshop';
import { isPast } from '@/domain/workshop/entities/Workshop';
import { PageHeading } from '@/presentation/components/layout/PageHeading';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/card';
import { Input } from '@/presentation/components/ui/input';
import { Label } from '@/presentation/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { useDirectory } from '@/presentation/hooks/useDirectory';
import { useWorkshops } from '@/presentation/hooks/useWorkshops';
import { AssessmentSummary, CheckInCount } from '@/presentation/pages/admin/WorkshopMetrics';

const ALL = 'todos';
const COLUMNS = 8;

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface WorkshopTableProps {
  workshops: Workshop[];
  pending: boolean;
  errorMessage: string | null;
  emptyMessage: string;
  companyName: (id: number) => string;
  facilitatorName: (id: string | null) => string | null;
}

function WorkshopTable({
  workshops,
  pending,
  errorMessage,
  emptyMessage,
  companyName,
  facilitatorName,
}: WorkshopTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-4">Data</TableHead>
          <TableHead>Oficina</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Aplicador</TableHead>
          <TableHead>Local</TableHead>
          <TableHead>Participantes</TableHead>
          <TableHead>Avaliação</TableHead>
          <TableHead className="pr-4 text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {pending &&
          Array.from({ length: 5 }, (_, index) => (
            <TableRow key={index} className="hover:bg-transparent">
              <TableCell colSpan={COLUMNS} className="px-4">
                <Skeleton className="h-8 w-full" />
              </TableCell>
            </TableRow>
          ))}

        {errorMessage !== null && (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={COLUMNS}
              className="py-10 text-center text-sm whitespace-normal text-destructive"
            >
              {errorMessage}
            </TableCell>
          </TableRow>
        )}

        {!pending && errorMessage === null && workshops.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell
              colSpan={COLUMNS}
              className="py-10 text-center text-sm whitespace-normal text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}

        {workshops.map((workshop) => {
          const facilitator = facilitatorName(workshop.facilitatorId);

          return (
            <TableRow key={workshop.id}>
              <TableCell className="pl-4 whitespace-nowrap">
                {formatDateTime(workshop.datetime)}
              </TableCell>
              <TableCell className="font-medium text-title">Oficina #{workshop.id}</TableCell>
              <TableCell className="text-muted-foreground">
                {companyName(workshop.companyId)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {facilitator ?? 'Não atribuído'}
              </TableCell>
              <TableCell className="max-w-48 truncate text-muted-foreground">
                {workshop.address}
              </TableCell>
              <TableCell>
                <CheckInCount workshopId={workshop.id} />
              </TableCell>
              <TableCell>
                <AssessmentSummary workshopId={workshop.id} />
              </TableCell>
              <TableCell className="pr-4 text-right">
                <Button variant="ghost" size="icon-sm" asChild title="Abrir detalhe">
                  <Link to="/admin/oficinas/$id" params={{ id: String(workshop.id) }}>
                    <ArrowRight className="size-4" />
                    <span className="sr-only">Abrir oficina #{workshop.id}</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export function WorkshopsPage() {
  const [company, setCompany] = useState(ALL);
  const [facilitator, setFacilitator] = useState(ALL);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  const directory = useDirectory();
  const companyId = company === ALL ? undefined : Number(company);
  const query = useWorkshops({ companyId, page });

  const workshops = useMemo(() => query.data?.workshops ?? [], [query.data]);

  const filtered = useMemo(() => {
    const start = fromDate === '' ? null : new Date(`${fromDate}T00:00:00`);
    const end = toDate === '' ? null : new Date(`${toDate}T23:59:59`);

    return workshops.filter((workshop) => {
      if (facilitator !== ALL && workshop.facilitatorId !== facilitator) return false;

      const date = new Date(workshop.datetime);
      if (Number.isNaN(date.getTime())) return true;

      if (start !== null && date < start) return false;
      if (end !== null && date > end) return false;

      return true;
    });
  }, [workshops, facilitator, fromDate, toDate]);

  const past = useMemo(() => filtered.filter((workshop) => isPast(workshop)), [filtered]);
  const upcoming = useMemo(() => filtered.filter((workshop) => !isPast(workshop)), [filtered]);

  const total = query.data?.total ?? 0;
  const perPage = query.data?.perPage ?? 0;
  const currentPage = query.data?.currentPage ?? page;
  const lastPage = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  const filtering = company !== ALL || facilitator !== ALL || fromDate !== '' || toDate !== '';

  const clearFilters = () => {
    setCompany(ALL);
    setFacilitator(ALL);
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const changeCompany = (value: string) => {
    setCompany(value);
    setPage(1);
  };

  const errorMessage = query.isError ? query.error.message : null;

  const tableProps = {
    pending: query.isPending,
    errorMessage,
    companyName: directory.companyName,
    facilitatorName: directory.facilitatorName,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeading title="Oficinas" subtitle="Oficinas de todas as empresas." />

      <Card>
        <CardHeader className="border-b">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Empresa</Label>
              <Select value={company} onValueChange={changeCompany}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todas</SelectItem>
                  {directory.companies.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Aplicador</Label>
              <Select value={facilitator} onValueChange={setFacilitator}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Todos</SelectItem>
                  {directory.facilitators.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workshop-from" className="text-xs text-muted-foreground">
                De
              </Label>
              <Input
                id="workshop-from"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-9"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workshop-to" className="text-xs text-muted-foreground">
                Até
              </Label>
              <Input
                id="workshop-to"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="h-9"
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={!filtering}
                className="h-9 w-full xl:w-auto"
              >
                <FilterX className="size-4" />
                Limpar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <Tabs defaultValue="realizadas">
            <TabsList className="mx-4">
              <TabsTrigger value="realizadas">Realizadas ({past.length})</TabsTrigger>
              <TabsTrigger value="proximas">Próximas ({upcoming.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="realizadas">
              <WorkshopTable
                {...tableProps}
                workshops={past}
                emptyMessage="Nenhuma oficina realizada nesta página."
              />
            </TabsContent>

            <TabsContent value="proximas">
              <WorkshopTable
                {...tableProps}
                workshops={upcoming}
                emptyMessage="Nenhuma oficina agendada nesta página."
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="justify-between gap-4">
          <span className="text-xs text-muted-foreground">
            {total === 0 ? 'Nenhum registro' : `Mostrando ${from}–${to} de ${total}`}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1 || query.isFetching}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>

            <span className="text-xs tabular-nums text-muted-foreground">
              {currentPage} / {lastPage}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((value) => value + 1)}
              disabled={currentPage >= lastPage || query.isFetching}
            >
              Próxima
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
