import { ChartColumn, ChevronLeft, ChevronRight, ShieldAlert, Table2 } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ForbiddenError } from '@/domain/shared/errors/AppError';
import { StatCard } from '@/presentation/components/dashboard/panels';
import type { ReportView } from '@/presentation/components/report/reportFilters';
import { Alert, AlertDescription, AlertTitle } from '@/presentation/components/ui/alert';
import { Button } from '@/presentation/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/presentation/components/ui/card';
import { Skeleton } from '@/presentation/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs';
import { TableCell, TableRow } from '@/presentation/components/ui/table';

export interface ReportStat {
  label: string;
  value: string;
  hint?: string;
  icon: ComponentType<{ className?: string }>;
}

const STAT_GRID: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export function ReportStatGrid({ items, loading }: { items: ReportStat[]; loading: boolean }) {
  return (
    <div className={cn('grid gap-3', STAT_GRID[items.length] ?? 'sm:grid-cols-3')}>
      {items.map((item) => (
        <StatCard
          key={item.label}
          label={item.label}
          value={item.value}
          hint={item.hint}
          icon={item.icon}
          loading={loading}
        />
      ))}
    </div>
  );
}

export function ReportViewToggle({
  value,
  onChange,
}: {
  value: ReportView;
  onChange: (view: ReportView) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as ReportView)} className="w-fit">
      <TabsList aria-label="Modo de visualização">
        <TabsTrigger value="tabela" className="px-3">
          <Table2 className="size-4" />
          <span className="hidden sm:inline">Tabela</span>
        </TabsTrigger>
        <TabsTrigger value="grafico" className="px-3">
          <ChartColumn className="size-4" />
          <span className="hidden sm:inline">Gráfico</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

export function ReportEmptyRow({ columns, label }: { columns: number; label: string }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell
        colSpan={columns}
        className="py-10 text-center text-sm whitespace-normal text-muted-foreground"
      >
        {label}
      </TableCell>
    </TableRow>
  );
}

function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="flex w-full items-end gap-2" style={{ height }}>
      {[45, 70, 55, 85, 60, 40, 75].map((percent, index) => (
        <Skeleton
          key={index}
          className="flex-1 animate-pulse rounded-t-md"
          style={{ height: `${percent}%` }}
        />
      ))}
    </div>
  );
}

export function AccessAlert({ endpoint }: { endpoint: string }) {
  return (
    <Alert variant="destructive">
      <ShieldAlert />
      <AlertTitle>Acesso restrito</AlertTitle>
      <AlertDescription>
        A rota <span className="font-mono">GET {endpoint}</span> não está liberada para o seu perfil.
        Solicite a liberação no backend para visualizar estes dados.
      </AlertDescription>
    </Alert>
  );
}

export function ReportPagination({
  currentPage,
  lastPage,
  total,
  perPage,
  fetching,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  fetching: boolean;
  onPageChange: (page: number) => void;
}) {
  const from = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <CardFooter className="justify-between gap-4">
      <span className="text-xs text-muted-foreground">
        {total === 0 ? 'Nenhum registro' : `Mostrando ${from}–${to} de ${total}`}
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || fetching}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <span className="text-xs tabular-nums text-muted-foreground">
          {currentPage} / {lastPage}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage || fetching}
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </CardFooter>
  );
}

interface ReportPanelProps {
  endpoint: string;
  filters: ReactNode;
  loading: boolean;
  error: Error | null;
  table: ReactNode;
  chart?: ReactNode;
  view?: ReportView;
  onViewChange?: (view: ReportView) => void;
  pagination?: ReactNode;
}

export function ReportPanel({
  endpoint,
  filters,
  loading,
  error,
  table,
  chart,
  view,
  onViewChange,
  pagination,
}: ReportPanelProps) {
  const forbidden = error instanceof ForbiddenError;
  const switchable = chart !== undefined && view !== undefined && onViewChange !== undefined;
  const isTable = !switchable || view === 'tabela';

  return (
    <div className="flex flex-col gap-4">
      {forbidden && <AccessAlert endpoint={endpoint} />}

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">{filters}</div>
            {switchable && <ReportViewToggle value={view} onChange={onViewChange} />}
          </div>
        </CardHeader>

        <CardContent className={isTable ? 'px-0' : undefined}>
          {error !== null && (
            <p className="px-4 py-10 text-center text-sm text-destructive">
              {forbidden ? 'Sem permissão para consultar este relatório.' : error.message}
            </p>
          )}

          {error === null && loading && (
            <>
              {isTable ? (
                <div className="px-4">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Skeleton key={index} className="mb-2 h-8 w-full" />
                  ))}
                </div>
              ) : (
                <ChartSkeleton />
              )}
            </>
          )}

          {error === null && !loading && (isTable ? table : chart)}
        </CardContent>

        {isTable && error === null && pagination}
      </Card>
    </div>
  );
}
