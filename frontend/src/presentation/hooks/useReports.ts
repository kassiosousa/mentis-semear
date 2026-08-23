import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { CompanyPanelReport } from '@/domain/report/entities/Report';
import type {
  AssessmentReportFilters,
  AssessmentsReport,
  CheckInReportFilters,
  CheckInsReport,
  CompaniesOverviewFilters,
  CompaniesOverviewReport,
  MoodReport,
  MoodReportFilters,
  WorkshopReportFilters,
  WorkshopsReport,
} from '@/domain/report/repositories/ReportRepository';
import { container } from '@/presentation/container';

export const reportKeys = {
  all: ['reports'] as const,
  workshops: (filters: WorkshopReportFilters) => [...reportKeys.all, 'workshops', filters] as const,
  checkIns: (filters: CheckInReportFilters) => [...reportKeys.all, 'check-ins', filters] as const,
  assessments: (filters: AssessmentReportFilters) =>
    [...reportKeys.all, 'assessments', filters] as const,
  mood: (filters: MoodReportFilters) => [...reportKeys.all, 'mood', filters] as const,
  companiesOverview: (filters: CompaniesOverviewFilters) =>
    [...reportKeys.all, 'companies-overview', filters] as const,
  companyPanel: (companyId: number) => [...reportKeys.all, 'company-panel', companyId] as const,
};

const BASE_OPTIONS = {
  placeholderData: keepPreviousData,
  staleTime: 60_000,
  meta: { silentError: true },
} as const;

export function useWorkshopsReport(filters: WorkshopReportFilters, enabled = true) {
  return useQuery<WorkshopsReport>({
    ...BASE_OPTIONS,
    queryKey: reportKeys.workshops(filters),
    queryFn: () => container.reports.workshops.execute(filters),
    enabled,
  });
}

export function useCheckInsReport(filters: CheckInReportFilters, enabled = true) {
  return useQuery<CheckInsReport>({
    ...BASE_OPTIONS,
    queryKey: reportKeys.checkIns(filters),
    queryFn: () => container.reports.checkIns.execute(filters),
    enabled,
  });
}

export function useAssessmentsReport(filters: AssessmentReportFilters, enabled = true) {
  return useQuery<AssessmentsReport>({
    ...BASE_OPTIONS,
    queryKey: reportKeys.assessments(filters),
    queryFn: () => container.reports.assessments.execute(filters),
    enabled,
  });
}

export function useMoodReport(filters: MoodReportFilters, enabled = true) {
  return useQuery<MoodReport>({
    ...BASE_OPTIONS,
    queryKey: reportKeys.mood(filters),
    queryFn: () => container.reports.mood.execute(filters),
    enabled,
  });
}

export function useCompaniesOverviewReport(filters: CompaniesOverviewFilters, enabled = true) {
  return useQuery<CompaniesOverviewReport>({
    ...BASE_OPTIONS,
    queryKey: reportKeys.companiesOverview(filters),
    queryFn: () => container.reports.companiesOverview.execute(filters),
    enabled,
  });
}

export function useCompanyPanelReport(companyId: number | null) {
  const resolved = companyId ?? 0;

  return useQuery<CompanyPanelReport>({
    ...BASE_OPTIONS,
    queryKey: reportKeys.companyPanel(resolved),
    queryFn: () => container.reports.companyPanel.execute(resolved),
    enabled: Number.isInteger(resolved) && resolved > 0,
  });
}
