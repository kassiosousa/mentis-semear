import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Log } from '@/domain/log/entities/Log';
import type { LogFilters, LogPage } from '@/domain/log/repositories/LogRepository';
import { container } from '@/presentation/container';

export const logKeys = {
  all: ['logs'] as const,
  list: (filters: LogFilters) => [...logKeys.all, 'list', filters] as const,
  detail: (id: number) => [...logKeys.all, 'detail', id] as const,
};

interface UseLogsOptions {
  enabled?: boolean;
  silentError?: boolean;
}

export function useLogs(
  filters: LogFilters,
  { enabled = true, silentError = false }: UseLogsOptions = {},
) {
  return useQuery<LogPage>({
    queryKey: logKeys.list(filters),
    queryFn: () => container.logs.list.execute(filters),
    placeholderData: keepPreviousData,
    meta: { silentError },
    enabled,
  });
}

export function useLog(id: number | null) {
  const resolved = id ?? 0;

  return useQuery<Log>({
    queryKey: logKeys.detail(resolved),
    queryFn: () => container.logs.find.execute(resolved),
    enabled: Number.isInteger(resolved) && resolved > 0,
  });
}
