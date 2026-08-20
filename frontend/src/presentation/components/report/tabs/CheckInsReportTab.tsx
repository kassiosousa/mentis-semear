import { Layers, ShieldCheck, Users } from 'lucide-react';
import { useMemo } from 'react';
import type { CheckInReportRow } from '@/domain/report/entities/Report';
import type { CheckInReportFilters } from '@/domain/report/repositories/ReportRepository';
import type { CsvColumn } from '@/lib/csv';
import { ReportFilterBar } from '@/presentation/components/report/ReportFilterBar';
import type { ReportFilterField } from '@/presentation/components/report/reportFilters';
import { idOf, periodOf } from '@/presentation/components/report/reportFilters';
import {
  formatDateTime,
  formatNumber,
  formatPercent,
  formatText,
} from '@/presentation/components/report/reportFormat';
import {
  ReportEmptyRow,
  ReportPagination,
  ReportPanel,
  ReportStatGrid,
} from '@/presentation/components/report/ReportPanel';
import type { ReportTabProps } from '@/presentation/components/report/tabs/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table';
import { loadCheckInRows, useReportCsv } from '@/presentation/hooks/useReportCsv';
import { useCheckInsReport } from '@/presentation/hooks/useReports';
import { useReportPage } from '@/presentation/hooks/useReportPage';

const COLUMNS = 4;

const FIELDS: ReportFilterField[] = ['period', 'company', 'sector', 'workshop', 'perPage'];

export function CheckInsReportTab({
  scope,
  companyId,
  facilitatorId,
  filters,
  onFilterChange,
  onClear,
}: ReportTabProps) {
  const query: CheckInReportFilters = {
    ...periodOf(filters, false),
    companyId: scope === 'admin' ? idOf(filters.companyId) : undefined,
    sectorId: scope === 'facilitador' ? undefined : idOf(filters.sectorId),
    workshopId: idOf(filters.workshopId),
    perPage: filters.perPage,
  };

  const [page, setPage] = useReportPage(JSON.stringify(query));
  const report = useCheckInsReport({ ...query, page });

  const summary = report.data?.summary;
  const rows = useMemo(() => report.data?.page.rows ?? [], [report.data]);

  const sectorNames = useMemo(
    () => new Map((summary?.bySector ?? []).map((entry) => [entry.sectorId, entry.sector])),
    [summary],
  );

  const sectorLabel = (sectorId: number | null): string => {
    if (sectorId === null) return 'Sem setor';

    return sectorNames.get(sectorId) ?? `#${sectorId}`;
  };

  const csvColumns: CsvColumn<CheckInReportRow>[] = [
    { header: 'ID', value: (row) => row.id },
    { header: 'Participante', value: (row) => row.name },
    { header: 'Cargo', value: (row) => row.position },
    { header: 'Setor', value: (row) => sectorLabel(row.sectorId) },
    { header: 'Gênero', value: (row) => row.gender },
    { header: 'Oficina', value: (row) => row.workshopId },
    { header: 'Data e hora', value: (row) => formatDateTime(row.createdAt) },
  ];

  const csv = useReportCsv({
    name: 'participacao',
    columns: csvColumns,
    load: () => loadCheckInRows(query),
  });

  return (
    <div className="flex flex-col gap-4">
      <ReportStatGrid
        loading={report.isPending}
        items={[
          { label: 'Participantes', value: formatNumber(summary?.total ?? null), icon: Users },
          {
            label: 'Setores alcançados',
            value: formatNumber(summary?.bySector.length ?? null),
            icon: Layers,
          },
          {
            label: 'Consentimento LGPD',
            value: formatPercent(summary?.lgpdConsentRate ?? null),
            icon: ShieldCheck,
          },
        ]}
      />

      <ReportPanel
        endpoint="/api/reports/check-ins"
        loading={report.isPending}
        error={report.error}
        csv={{ ...csv, disabled: rows.length === 0 }}
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
                <TableHead className="pl-4">Participante</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead className="pr-4">Data e hora</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 && (
                <ReportEmptyRow
                  columns={COLUMNS}
                  label="Nenhum check-in encontrado para os filtros aplicados."
                />
              )}

              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-4 font-medium">{formatText(row.name)}</TableCell>
                  <TableCell>{sectorLabel(row.sectorId)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatText(row.position)}
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
