import type { UserType } from '@/domain/auth/entities/User';
import type { PeriodFilters } from '@/domain/report/repositories/ReportRepository';
import { DEFAULT_REPORT_PER_PAGE } from '@/domain/report/repositories/ReportRepository';

export const ALL = 'todos';

export type ReportScope = Extract<UserType, 'admin' | 'empresa' | 'facilitador'>;

export type ReportView = 'tabela' | 'grafico';

export type ReportFilterField =
  | 'period'
  | 'time'
  | 'company'
  | 'sector'
  | 'workshop'
  | 'facilitator'
  | 'score'
  | 'diary'
  | 'perPage';

export interface ReportFilterState {
  dateFrom: string;
  dateTo: string;
  timeFrom: string;
  timeTo: string;
  companyId: string;
  sectorId: string;
  workshopId: string;
  facilitatorId: string;
  minScore: string;
  maxScore: string;
  hasDiary: string;
  perPage: number;
}

export const INITIAL_FILTERS: ReportFilterState = {
  dateFrom: '',
  dateTo: '',
  timeFrom: '',
  timeTo: '',
  companyId: ALL,
  sectorId: ALL,
  workshopId: ALL,
  facilitatorId: ALL,
  minScore: '',
  maxScore: '',
  hasDiary: ALL,
  perPage: DEFAULT_REPORT_PER_PAGE,
};

export function textOf(value: string): string | undefined {
  const trimmed = value.trim();

  return trimmed === '' ? undefined : trimmed;
}

export function idOf(value: string): number | undefined {
  if (value === ALL || value === '') return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function uuidOf(value: string): string | undefined {
  return value === ALL || value === '' ? undefined : value;
}

export function scoreOf(value: string): number | undefined {
  const trimmed = value.trim();

  if (trimmed === '') return undefined;

  const parsed = Number(trimmed.replace(',', '.'));

  return Number.isFinite(parsed) ? parsed : undefined;
}

export function flagOf(value: string): boolean | undefined {
  if (value === 'sim') return true;
  if (value === 'nao') return false;

  return undefined;
}

export function periodOf(filters: ReportFilterState, withTime: boolean): PeriodFilters {
  return {
    dateFrom: textOf(filters.dateFrom),
    dateTo: textOf(filters.dateTo),
    timeFrom: withTime ? textOf(filters.timeFrom) : undefined,
    timeTo: withTime ? textOf(filters.timeTo) : undefined,
  };
}

export function isFieldActive(filters: ReportFilterState, field: ReportFilterField): boolean {
  switch (field) {
    case 'period':
      return filters.dateFrom !== '' || filters.dateTo !== '';
    case 'time':
      return filters.timeFrom !== '' || filters.timeTo !== '';
    case 'company':
      return filters.companyId !== ALL;
    case 'sector':
      return filters.sectorId !== ALL;
    case 'workshop':
      return filters.workshopId !== ALL;
    case 'facilitator':
      return filters.facilitatorId !== ALL;
    case 'score':
      return filters.minScore !== '' || filters.maxScore !== '';
    case 'diary':
      return filters.hasDiary !== ALL;
    case 'perPage':
      return filters.perPage !== DEFAULT_REPORT_PER_PAGE;
  }
}

export function countActive(
  filters: ReportFilterState,
  fields: readonly ReportFilterField[],
): number {
  return fields.filter((field) => isFieldActive(filters, field)).length;
}
