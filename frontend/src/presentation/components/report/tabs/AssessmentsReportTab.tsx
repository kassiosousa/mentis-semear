import { Gauge, MessageSquareQuote, Star } from 'lucide-react';
import { useMemo } from 'react';
import type { AssessmentReportFilters } from '@/domain/report/repositories/ReportRepository';
import { ReportFilterBar } from '@/presentation/components/report/ReportFilterBar';
import type { ReportFilterField } from '@/presentation/components/report/reportFilters';
import { idOf, periodOf } from '@/presentation/components/report/reportFilters';
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
import { useAssessmentsReport } from '@/presentation/hooks/useReports';
import { useReportPage } from '@/presentation/hooks/useReportPage';

const COLUMNS = 4;

const FIELDS: ReportFilterField[] = ['period', 'company', 'workshop', 'perPage'];

export function AssessmentsReportTab({
  scope,
  companyId,
  facilitatorId,
  filters,
  onFilterChange,
  onClear,
}: ReportTabProps) {
  const query: AssessmentReportFilters = {
    ...periodOf(filters, false),
    companyId: scope === 'admin' ? idOf(filters.companyId) : undefined,
    workshopId: idOf(filters.workshopId),
    perPage: filters.perPage,
  };

  const [page, setPage] = useReportPage(JSON.stringify(query));
  const report = useAssessmentsReport({ ...query, page });

  const summary = report.data?.summary;
  const rows = useMemo(() => report.data?.page.rows ?? [], [report.data]);

  return (
    <div className="flex flex-col gap-4">
      <ReportStatGrid
        loading={report.isPending}
        items={[
          {
            label: 'Avaliações',
            value: formatNumber(summary?.total ?? null),
            icon: MessageSquareQuote,
          },
          {
            label: 'Nota média',
            value: formatDecimal(summary?.average ?? null),
            icon: Star,
          },
          {
            label: 'NPS',
            value: summary?.nps.score == null ? '—' : formatDecimal(summary.nps.score, 0),
            icon: Gauge,
          },
        ]}
      />

      <ReportPanel
        endpoint="/api/reports/assessments"
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
                <TableHead className="pl-4">Oficina</TableHead>
                <TableHead>Nota</TableHead>
                <TableHead>Sugestões</TableHead>
                <TableHead className="pr-4">Data e hora</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 && (
                <ReportEmptyRow
                  columns={COLUMNS}
                  label="Nenhuma avaliação encontrada para os filtros aplicados."
                />
              )}

              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-4 tabular-nums text-muted-foreground">
                    {row.workshopId === null ? '—' : `#${row.workshopId}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="tabular-nums">
                      {row.score === null ? '—' : formatDecimal(row.score, 0)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-96 whitespace-normal text-muted-foreground">
                    {formatText(row.suggestions)}
                  </TableCell>
                  <TableCell className="pr-4 tabular-nums text-muted-foreground">
                    {formatDateTime(row.createdAt)}
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
