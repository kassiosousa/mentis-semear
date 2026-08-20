import { HeartPulse, Layers, ThermometerSun } from 'lucide-react';
import { useMemo } from 'react';
import { moodLabel, moodScoreFromAverage } from '@/domain/mood/entities/MoodSummary';
import type { MoodReportRow } from '@/domain/report/entities/Report';
import type { MoodReportFilters } from '@/domain/report/repositories/ReportRepository';
import type { CsvColumn } from '@/lib/csv';
import { MoodFace } from '@/presentation/components/mood/MoodFace';
import { ReportFilterBar } from '@/presentation/components/report/ReportFilterBar';
import type { ReportFilterField } from '@/presentation/components/report/reportFilters';
import { idOf, periodOf } from '@/presentation/components/report/reportFilters';
import {
  formatDateTime,
  formatDecimal,
  formatNumber,
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
import { loadMoodRows, useReportCsv } from '@/presentation/hooks/useReportCsv';
import { useMoodReport } from '@/presentation/hooks/useReports';
import { useReportPage } from '@/presentation/hooks/useReportPage';

const COLUMNS = 3;

const FIELDS: ReportFilterField[] = ['period', 'time', 'company', 'sector', 'perPage'];

export function MoodReportTab({
  scope,
  companyId,
  facilitatorId,
  filters,
  onFilterChange,
  onClear,
}: ReportTabProps) {
  const query: MoodReportFilters = {
    ...periodOf(filters, true),
    companyId: scope === 'admin' ? idOf(filters.companyId) : undefined,
    sectorId: idOf(filters.sectorId),
    perPage: filters.perPage,
  };

  const [page, setPage] = useReportPage(JSON.stringify(query));
  const report = useMoodReport({ ...query, page });

  const summary = report.data?.summary;
  const rows = useMemo(() => report.data?.page.rows ?? [], [report.data]);

  const sectorNames = useMemo(
    () => new Map((summary?.bySector ?? []).map((entry) => [entry.sectorId, entry.sector])),
    [summary],
  );

  const averageScore = moodScoreFromAverage(summary?.average ?? null);

  const sectorLabel = (sectorId: number | null): string => {
    if (sectorId === null) return 'Sem setor';

    return sectorNames.get(sectorId) ?? `#${sectorId}`;
  };

  const csvColumns: CsvColumn<MoodReportRow>[] = [
    { header: 'ID', value: (row) => row.id },
    { header: 'Data e hora', value: (row) => formatDateTime(row.createdAt) },
    { header: 'Setor', value: (row) => sectorLabel(row.sectorId) },
    { header: 'Humor', value: (row) => row.mood },
    { header: 'Descrição', value: (row) => moodLabel(moodScoreFromAverage(row.mood)) },
  ];

  const csv = useReportCsv({
    name: 'termometro',
    columns: csvColumns,
    load: () => loadMoodRows(query),
  });

  return (
    <div className="flex flex-col gap-4">
      <ReportStatGrid
        loading={report.isPending}
        items={[
          { label: 'Registros', value: formatNumber(summary?.total ?? null), icon: ThermometerSun },
          {
            label: 'Humor médio',
            value: formatDecimal(summary?.average ?? null, 2),
            hint: averageScore === null ? 'Escala de 1 a 5' : moodLabel(averageScore),
            icon: HeartPulse,
          },
          {
            label: 'Setores participantes',
            value: formatNumber(summary?.bySector.length ?? null),
            icon: Layers,
          },
        ]}
      />

      <ReportPanel
        endpoint="/api/reports/mood"
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
                <TableHead className="pl-4">Data e hora</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead className="pr-4">Humor</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.length === 0 && (
                <ReportEmptyRow
                  columns={COLUMNS}
                  label="Nenhum registro do termômetro para os filtros aplicados."
                />
              )}

              {rows.map((row) => {
                const score = moodScoreFromAverage(row.mood);

                return (
                  <TableRow key={row.id}>
                    <TableCell className="pl-4 tabular-nums">
                      {formatDateTime(row.createdAt)}
                    </TableCell>
                    <TableCell>{sectorLabel(row.sectorId)}</TableCell>
                    <TableCell className="pr-4">
                      <span className="inline-flex items-center gap-2">
                        <MoodFace score={score} size="sm" />
                        {moodLabel(score)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        }
      />
    </div>
  );
}
