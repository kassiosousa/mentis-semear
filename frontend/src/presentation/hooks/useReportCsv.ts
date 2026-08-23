import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  AssessmentReportFilters,
  CheckInReportFilters,
  CompaniesOverviewFilters,
  MoodReportFilters,
  ReportPage,
  WorkshopReportFilters,
} from '@/domain/report/repositories/ReportRepository';
import type { CsvColumn } from '@/lib/csv';
import { csvFilename, downloadCsv, toCsv } from '@/lib/csv';
import { container } from '@/presentation/container';

const EXPORT_PER_PAGE = 100;

const MAX_PAGES = 50;

export interface ExportResult<TRow> {
  rows: TRow[];
  truncated: boolean;
}

async function loadAllPages<TRow>(
  fetchPage: (page: number, perPage: number) => Promise<ReportPage<TRow>>,
): Promise<ExportResult<TRow>> {
  const rows: TRow[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const result = await fetchPage(page, EXPORT_PER_PAGE);

    rows.push(...result.rows);
    lastPage = result.lastPage;
    page += 1;
  } while (page <= lastPage && page <= MAX_PAGES);

  return { rows, truncated: lastPage > MAX_PAGES };
}

export function loadWorkshopRows(filters: WorkshopReportFilters) {
  return loadAllPages((page, perPage) =>
    container.reports.workshops.execute({ ...filters, page, perPage }).then((it) => it.page),
  );
}

export function loadCheckInRows(filters: CheckInReportFilters) {
  return loadAllPages((page, perPage) =>
    container.reports.checkIns.execute({ ...filters, page, perPage }).then((it) => it.page),
  );
}

export function loadAssessmentRows(filters: AssessmentReportFilters) {
  return loadAllPages((page, perPage) =>
    container.reports.assessments.execute({ ...filters, page, perPage }).then((it) => it.page),
  );
}

export function loadMoodRows(filters: MoodReportFilters) {
  return loadAllPages((page, perPage) =>
    container.reports.mood.execute({ ...filters, page, perPage }).then((it) => it.page),
  );
}

export function loadCompanyOverviewRows(filters: CompaniesOverviewFilters) {
  return loadAllPages((page, perPage) =>
    container.reports.companiesOverview
      .execute({ ...filters, page, perPage })
      .then((it) => it.page),
  );
}

interface UseReportCsvOptions<TRow> {
  name: string;
  columns: readonly CsvColumn<TRow>[];
  load: () => Promise<ExportResult<TRow>>;
}

export function useReportCsv<TRow>({ name, columns, load }: UseReportCsvOptions<TRow>) {
  const mutation = useMutation({
    mutationFn: async () => {
      const { rows, truncated } = await load();

      downloadCsv(csvFilename(`relatorio-${name}`), toCsv(rows, columns));

      return { total: rows.length, truncated };
    },
    onSuccess: ({ total, truncated }) => {
      if (total === 0) {
        toast.info('Nenhum registro para exportar com os filtros aplicados.');

        return;
      }

      toast.success(
        truncated
          ? `Exportadas as primeiras ${total} linhas. Refine os filtros para incluir o restante.`
          : `${total} ${total === 1 ? 'linha exportada' : 'linhas exportadas'}.`,
      );
    },
    onError: (error: Error) => {
      toast.error(`Não foi possível exportar: ${error.message}`);
    },
  });

  return { run: () => mutation.mutate(), exporting: mutation.isPending };
}
