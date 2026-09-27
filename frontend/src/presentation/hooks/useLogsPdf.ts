import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Log } from '@/domain/log/entities/Log';
import type { PdfColumn } from '@/lib/pdf';
import { downloadPdfTable, pdfFilename } from '@/lib/pdf';
import { container } from '@/presentation/container';

const EXPORT_PER_PAGE = 100;

const MAX_PAGES = 50;

interface LoadResult {
  logs: Log[];
  truncated: boolean;
}

async function loadAllLogs(): Promise<LoadResult> {
  const logs: Log[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const result = await container.logs.list.execute({ page, perPage: EXPORT_PER_PAGE });

    logs.push(...result.logs);
    lastPage = result.lastPage;
    page += 1;
  } while (page <= lastPage && page <= MAX_PAGES);

  return { logs, truncated: lastPage > MAX_PAGES };
}

interface UseLogsPdfOptions<TRow> {
  select: (logs: readonly Log[]) => readonly TRow[];
  columns: readonly PdfColumn<TRow>[];
  subtitle: string;
}

export function useLogsPdf<TRow>({ select, columns, subtitle }: UseLogsPdfOptions<TRow>) {
  const mutation = useMutation({
    mutationFn: async () => {
      const { logs, truncated } = await loadAllLogs();
      const rows = select(logs);

      if (rows.length > 0) {
        await downloadPdfTable({
          filename: pdfFilename('logs'),
          title: 'Logs',
          subtitle,
          columns,
          rows,
        });
      }

      return { total: rows.length, truncated };
    },
    onSuccess: ({ total, truncated }) => {
      if (total === 0) {
        toast.info('Nenhum log para exportar com os filtros aplicados.');

        return;
      }

      toast.success(
        truncated
          ? `Exportados os ${total} registros mais recentes. O histórico mais antigo ficou de fora.`
          : `${total} ${total === 1 ? 'registro exportado' : 'registros exportados'}.`,
      );
    },
    onError: (error: Error) => {
      toast.error(`Não foi possível exportar: ${error.message}`);
    },
  });

  return { run: () => mutation.mutate(), exporting: mutation.isPending };
}
