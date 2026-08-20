import { CalendarRange, Star, Users } from 'lucide-react';
import { useMemo } from 'react';
import type { WorkshopReportFilters } from '@/domain/report/repositories/ReportRepository';
import { ReportFilterBar } from '@/presentation/components/report/ReportFilterBar';
import type { ReportFilterField } from '@/presentation/components/report/reportFilters';
import {
  flagOf,
  idOf,
  periodOf,
  scoreOf,
  uuidOf,
} from '@/presentation/components/report/reportFilters';
import {
  formatDateTime,
  formatDecimal,
  formatNumber,
  formatText,
} from '@/presentation/components/report/reportFormat';
import {
  ReportEmptyRow,
  ReportPagination,
  ReportPanel,
  ReportStatGrid,
} from '@/presentation/components/report/ReportPanel';
import type { ReportTabProps } from '@/presentation/components/report/tabs/types';
import { Badge } from '@/presentation/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { useWorkshopsReport } from '@/presentation/hooks/useReports';
import { useReportPage } from '@/presentation/hooks/useReportPage';

const COLUMNS = 5;

const FIELDS: ReportFilterField[] = [
  'period',
  'time',
  'company',
  'facilitator',
  'score',
  'diary',
  'perPage',
];

export function WorkshopsReportTab({
  scope,
  companyId,
  facilitatorId,
  filters,
  onFilterChange,
  onClear,
}: ReportTabProps) {
  const query: WorkshopReportFilters = {
    ...periodOf(filters, true),
    companyId: scope === 'admin' ? idOf(filters.companyId) : undefined,
    facilitatorId:
      scope === 'facilitador' ? (facilitatorId ?? undefined) : uuidOf(filters.facilitatorId),
    minScore: scoreOf(filters.minScore),
    maxScore: scoreOf(filters.maxScore),
    hasDiary: flagOf(filters.hasDiary),
    perPage: filters.perPage,
  };

  const [page, setPage] = useReportPage(JSON.stringify(query));
  const report = useWorkshopsReport({ ...query, page });

  const summary = report.data?.summary;
  const rows = useMemo(() => report.data?.page.rows ?? [], [report.data]);

  return (
    <div className="flex flex-col gap-4">
      <ReportStatGrid
        loading={report.isPending}
        items={[
          {
            label: 'Oficinas',
            value: formatNumber(summary?.totalWorkshops ?? null),
            icon: CalendarRange,
          },
          {
            label: 'Check-ins',
            value: formatNumber(summary?.totalCheckIns ?? null),
            icon: Users,
          },
          {
            label: 'Nota média',
            value: formatDecimal(summary?.avgScore ?? null),
            icon: Star,
          },
        ]}
      />

      <ReportPanel
        endpoint="/api/reports/workshops"
        loading={report.isPending}
        error={report.error}
        filters={
          <ReportFilterBar
            scope={scope}
            companyId={companyId}
            facilitatorId={scope === 'facilitador' ? facilitatorId : null}
            fields={FIELDS}
            value={filters}
            onChange={onFilterChange}
            onClear={onClear}
          />
        }
        pagination={
          report.data === undefined ? undefined : (
            <ReportPagination
              currentPage={report.data.page.currentPage}
              lastPage={report.data.page.lastPage}
              total={report.data.page.total}
              perPage={report.data.page.perPage}
              fetching={report.isFetching}
              onPageChange={setPage}
            />
          )
        }
        table={
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Data e hora</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Facilitador</TableHead>
                <TableHead className="text-right">Check-ins</TableHead>
                <TableHead className="pr-4 text-right">Nota média</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 && (
                <ReportEmptyRow
                  columns={COLUMNS}
                  label="Nenhuma oficina encontrada para os filtros aplicados."
                />
              )}

              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-4 tabular-nums">
                    {formatDateTime(row.datetime)}
                  </TableCell>
                  <TableCell>{formatText(row.company)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatText(row.facilitator)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(row.checkIns)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    {row.avgScore === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Badge variant="secondary" className="tabular-nums">
                        {formatDecimal(row.avgScore)}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
      />
    </div>
  );
}
