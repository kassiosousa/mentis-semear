import type {
  AssessmentReportRow,
  AssessmentsReportSummary,
  CheckInReportRow,
  CheckInsReportSummary,
  CompaniesOverviewSummary,
  CompanyOverviewRow,
  CompanyPanelReport,
  MoodReportRow,
  MoodReportSummary,
  WorkshopReportRow,
  WorkshopsReportSummary,
} from '@/domain/report/entities/Report';

export const REPORT_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

export const DEFAULT_REPORT_PER_PAGE = 25;

export interface PeriodFilters {
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
}

export interface PageFilters {
  page?: number;
  perPage?: number;
}

export interface WorkshopReportFilters extends PeriodFilters, PageFilters {
  companyId?: number;
  facilitatorId?: string;
  minScore?: number;
  maxScore?: number;
  hasDiary?: boolean;
}

export interface CheckInReportFilters extends PeriodFilters, PageFilters {
  companyId?: number;
  workshopId?: number;
  sectorId?: number;
}

export interface AssessmentReportFilters extends PeriodFilters, PageFilters {
  companyId?: number;
  workshopId?: number;
}

export interface MoodReportFilters extends PeriodFilters, PageFilters {
  companyId?: number;
  sectorId?: number;
}

export type CompaniesOverviewFilters = PeriodFilters & PageFilters;

export interface ReportPage<TRow> {
  rows: TRow[];
  currentPage: number;
  perPage: number;
  lastPage: number;
  total: number;
}

export interface ReportResult<TSummary, TRow> {
  summary: TSummary;
  page: ReportPage<TRow>;
}

export type WorkshopsReport = ReportResult<WorkshopsReportSummary, WorkshopReportRow>;

export type CheckInsReport = ReportResult<CheckInsReportSummary, CheckInReportRow>;

export type AssessmentsReport = ReportResult<AssessmentsReportSummary, AssessmentReportRow>;

export type MoodReport = ReportResult<MoodReportSummary, MoodReportRow>;

export type CompaniesOverviewReport = ReportResult<CompaniesOverviewSummary, CompanyOverviewRow>;

export interface ReportRepository {
  workshops(filters?: WorkshopReportFilters): Promise<WorkshopsReport>;
  checkIns(filters?: CheckInReportFilters): Promise<CheckInsReport>;
  assessments(filters?: AssessmentReportFilters): Promise<AssessmentsReport>;
  mood(filters?: MoodReportFilters): Promise<MoodReport>;
  companiesOverview(filters?: CompaniesOverviewFilters): Promise<CompaniesOverviewReport>;
  companyPanel(companyId: number): Promise<CompanyPanelReport>;
}
