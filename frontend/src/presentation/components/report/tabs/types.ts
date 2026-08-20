import type {
  ReportFilterState,
  ReportScope,
} from '@/presentation/components/report/reportFilters';

export interface ReportTabProps {
  scope: ReportScope;
  companyId: number | null;
  facilitatorId: string | null;
  filters: ReportFilterState;
  onFilterChange: (patch: Partial<ReportFilterState>) => void;
  onClear: () => void;
}
