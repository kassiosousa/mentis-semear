import type { Log } from '@/domain/log/entities/Log';

export const LOG_PER_PAGE_OPTIONS = [15, 30, 50, 100] as const;

export const DEFAULT_LOG_PER_PAGE = 30;

export interface LogFilters {
  userId?: string;
  page?: number;
  perPage?: number;
}

export interface LogPage {
  logs: Log[];
  currentPage: number;
  perPage: number;
  lastPage: number;
  total: number;
}

export interface LogRepository {
  list(filters?: LogFilters): Promise<LogPage>;
  find(id: number): Promise<Log>;
}
