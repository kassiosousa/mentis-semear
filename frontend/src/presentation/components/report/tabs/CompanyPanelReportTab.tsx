import { CalendarRange, HeartPulse, Star } from 'lucide-react';
import { moodLabel, moodScoreFromAverage } from '@/domain/mood/entities/MoodSummary';
import type { SectorMoodPoint } from '@/domain/report/entities/Report';
import type { CsvColumn } from '@/lib/csv';
import { MoodFace } from '@/presentation/components/mood/MoodFace';
import { ReportFilterBar } from '@/presentation/components/report/ReportFilterBar';
import type { ReportFilterField } from '@/presentation/components/report/reportFilters';
import { idOf } from '@/presentation/components/report/reportFilters';
import { formatDecimal, formatNumber } from '@/presentation/components/report/reportFormat';
import {
  ReportEmptyRow,
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
import { useReportCsv } from '@/presentation/hooks/useReportCsv';
import { useCompanyPanelReport } from '@/presentation/hooks/useReports';

const COLUMNS = 3;

const FIELDS: ReportFilterField[] = ['company'];

const CSV_COLUMNS: CsvColumn<SectorMoodPoint>[] = [
  { header: 'Setor', value: (row) => row.sector },
  { header: 'Registros', value: (row) => row.total },
  { header: 'Humor médio', value: (row) => row.average },
  { header: 'Descrição', value: (row) => moodLabel(moodScoreFromAverage(row.average)) },
];

export function CompanyPanelReportTab({
  scope,
  companyId,
  facilitatorId,
  filters,
  onFilterChange,
  onClear,
}: ReportTabProps) {
  const target = scope === 'admin' ? (idOf(filters.companyId) ?? null) : companyId;

  const report = useCompanyPanelReport(target);
  const panel = report.data;
  const waiting = target === null;

  const moodScore = moodScoreFromAverage(panel?.mood.average ?? null);
  const sectors = panel?.mood.bySector ?? [];

  const csv = useReportCsv({
    name: `empresa-${panel?.company ?? target}`,
    columns: CSV_COLUMNS,
    load: async () => ({ rows: sectors, truncated: false }),
  });

  return (
    <div className="flex flex-col gap-4">
      <ReportStatGrid
        loading={report.isPending && !waiting}
        items={[
          {
            label: 'Oficinas',
            value: waiting ? '—' : formatNumber(panel?.workshops ?? null),
            hint: waiting ? undefined : `${formatNumber(panel?.checkIns ?? null)} check-ins`,
            icon: CalendarRange,
          },
          {
            label: 'Satisfação média',
            value: waiting ? '—' : formatDecimal(panel?.satisfaction.average ?? null),
            hint: waiting ? undefined : `${formatNumber(panel?.satisfaction.total ?? null)} respostas`,
            icon: Star,
          },
          {
            label: 'Humor médio',
            value: waiting ? '—' : formatDecimal(panel?.mood.average ?? null, 2),
            hint: moodScore === null ? 'Escala de 1 a 5' : moodLabel(moodScore),
            icon: HeartPulse,
          },
        ]}
      />

      <ReportPanel
        endpoint="/api/reports/company/{company}"
        loading={report.isPending && !waiting}
        error={report.error}
        csv={{ ...csv, disabled: sectors.length === 0 }}
        filters={
          scope === 'admin' ? (
            <ReportFilterBar
              scope={scope}
              companyId={companyId}
              facilitatorId={facilitatorId}
              fields={FIELDS}
              primary={FIELDS}
              value={filters}
              onChange={onFilterChange}
              onClear={onClear}
            />
          ) : null
        }
        table={
          waiting ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              Selecione uma empresa para carregar o painel consolidado.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Setor</TableHead>
                  <TableHead className="text-right">Registros</TableHead>
                  <TableHead className="pr-4 text-right">Humor médio</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sectors.length === 0 && (
                  <ReportEmptyRow
                    columns={COLUMNS}
                    label="Nenhum registro do termômetro para esta empresa."
                  />
                )}

                {sectors.map((entry) => (
                  <TableRow key={entry.sectorId ?? entry.sector}>
                    <TableCell className="pl-4">{entry.sector}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(entry.total)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <span className="flex items-center justify-end gap-2 tabular-nums">
                        <MoodFace score={moodScoreFromAverage(entry.average)} size="sm" />
                        {formatDecimal(entry.average, 2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )
        }
      />
    </div>
  );
}
