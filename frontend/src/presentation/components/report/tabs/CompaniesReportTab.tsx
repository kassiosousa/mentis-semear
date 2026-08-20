import { ArrowRight, Building2, CalendarRange, Star } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import type { CompanyOverviewRow } from '@/domain/report/entities/Report';
import type { CompaniesOverviewFilters } from '@/domain/report/repositories/ReportRepository';
import type { CsvColumn } from '@/lib/csv';
import { CHART_COLORS } from '@/presentation/components/report/chartColors';
import { ReportFilterBar } from '@/presentation/components/report/ReportFilterBar';
import type { ChartDatum } from '@/presentation/components/report/ReportCharts';
import { ChartPanel, ReportBarChart } from '@/presentation/components/report/ReportCharts';
import type {
  ReportFilterField,
  ReportView,
} from '@/presentation/components/report/reportFilters';
import { periodOf } from '@/presentation/components/report/reportFilters';
import { formatDecimal, formatNumber } from '@/presentation/components/report/reportFormat';
import {
  ReportEmptyRow,
  ReportPagination,
  ReportPanel,
  ReportStatGrid,
} from '@/presentation/components/report/ReportPanel';
import type { ReportTabProps } from '@/presentation/components/report/tabs/types';
import { Badge } from '@/presentation/components/ui/badge';
import { Button } from '@/presentation/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { loadCompanyOverviewRows, useReportCsv } from '@/presentation/hooks/useReportCsv';
import { useCompaniesOverviewReport } from '@/presentation/hooks/useReports';
import { useReportPage } from '@/presentation/hooks/useReportPage';

const COLUMNS = 5;

const FIELDS: ReportFilterField[] = ['period', 'time', 'perPage'];

const CSV_COLUMNS: CsvColumn<CompanyOverviewRow>[] = [
  { header: 'ID', value: (row) => row.companyId },
  { header: 'Empresa', value: (row) => row.company },
  { header: 'Oficinas', value: (row) => row.workshops },
  { header: 'Check-ins', value: (row) => row.checkIns },
  { header: 'Nota média', value: (row) => row.avgScore },
];

export function CompaniesReportTab({
  scope,
  companyId,
  facilitatorId,
  filters,
  onFilterChange,
  onClear,
}: ReportTabProps) {
  const [view, setView] = useState<ReportView>('tabela');

  const query: CompaniesOverviewFilters = {
    ...periodOf(filters, true),
    perPage: filters.perPage,
  };

  const [page, setPage] = useReportPage(JSON.stringify(query));
  const report = useCompaniesOverviewReport({ ...query, page });

  const summary = report.data?.summary;
  const rows = useMemo(() => report.data?.page.rows ?? [], [report.data]);

  const csv = useReportCsv({
    name: 'empresas',
    columns: CSV_COLUMNS,
    load: () => loadCompanyOverviewRows(query),
  });

  const volume = useMemo<ChartDatum[]>(
    () =>
      rows.map((row) => ({
        empresa: row.company,
        workshops: row.workshops,
        checkIns: row.checkIns,
      })),
    [rows],
  );

  const scores = useMemo<ChartDatum[]>(
    () =>
      rows
        .filter((row) => row.avgScore !== null)
        .map((row) => ({ empresa: row.company, avgScore: row.avgScore })),
    [rows],
  );

  return (
    <div className="flex flex-col gap-4">
      <ReportStatGrid
        loading={report.isPending}
        items={[
          {
            label: 'Empresas',
            value: formatNumber(summary?.totalCompanies ?? null),
            icon: Building2,
          },
          {
            label: 'Oficinas',
            value: formatNumber(summary?.totalWorkshops ?? null),
            hint: `${formatNumber(summary?.totalCheckIns ?? null)} check-ins`,
            icon: CalendarRange,
          },
          {
            label: 'Nota média',
            value: formatDecimal(summary?.avgScore ?? null),
            icon: Star,
          },
        ]}
      />

      <ReportPanel
        endpoint="/api/reports/companies-overview"
        view={view}
        onViewChange={setView}
        loading={report.isPending}
        error={report.error}
        csv={{ ...csv, disabled: rows.length === 0 }}
        filters={
          <ReportFilterBar
            scope={scope}
            companyId={companyId}
            facilitatorId={facilitatorId}
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
                <TableHead className="pl-4">Empresa</TableHead>
                <TableHead className="text-right">Oficinas</TableHead>
                <TableHead className="text-right">Check-ins</TableHead>
                <TableHead className="text-right">Nota média</TableHead>
                <TableHead className="pr-4 text-right">Painel</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 && (
                <ReportEmptyRow
                  columns={COLUMNS}
                  label="Nenhuma empresa encontrada para os filtros aplicados."
                />
              )}

              {rows.map((row) => (
                <TableRow key={row.companyId}>
                  <TableCell className="pl-4 font-medium">
                    <Link
                      to="/admin/relatorios/empresas/$id"
                      params={{ id: String(row.companyId) }}
                      className="rounded-sm underline-offset-4 outline-none hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {row.company}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(row.workshops)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatNumber(row.checkIns)}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.avgScore === null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Badge variant="secondary" className="tabular-nums">
                        {formatDecimal(row.avgScore)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link
                          to="/admin/relatorios/empresas/$id"
                          params={{ id: String(row.companyId) }}
                        >
                          <ArrowRight className="size-4" />
                          <span className="sr-only">{`Abrir painel de ${row.company}`}</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        }
        chart={
          <div className="flex flex-col gap-4">
            <ChartPanel
              title="Volume por empresa"
              description="Oficinas realizadas e check-ins registrados."
            >
              <ReportBarChart
                data={volume}
                xKey="empresa"
                horizontal
                series={[
                  { key: 'workshops', label: 'Oficinas', color: CHART_COLORS[0] },
                  { key: 'checkIns', label: 'Check-ins', color: CHART_COLORS[1] },
                ]}
              />
            </ChartPanel>

            <ChartPanel
              title="Nota média por empresa"
              description="Satisfação média das oficinas de cada empresa."
            >
              <ReportBarChart
                data={scores}
                xKey="empresa"
                horizontal
                allowDecimals
                emptyLabel="Nenhuma empresa com avaliações no período."
                series={[{ key: 'avgScore', label: 'Nota média', color: CHART_COLORS[2] }]}
              />
            </ChartPanel>
          </div>
        }
      />
    </div>
  );
}
