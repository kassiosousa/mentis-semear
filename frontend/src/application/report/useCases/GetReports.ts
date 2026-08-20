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
  ReportRepository,
  WorkshopReportFilters,
  WorkshopsReport,
} from '@/domain/report/repositories/ReportRepository';

export class GetWorkshopsReport {
  constructor(private readonly reports: ReportRepository) {}

  execute(filters: WorkshopReportFilters = {}): Promise<WorkshopsReport> {
    return this.reports.workshops(filters);
  }
}

export class GetCheckInsReport {
  constructor(private readonly reports: ReportRepository) {}

  execute(filters: CheckInReportFilters = {}): Promise<CheckInsReport> {
    return this.reports.checkIns(filters);
  }
}

export class GetAssessmentsReport {
  constructor(private readonly reports: ReportRepository) {}

  execute(filters: AssessmentReportFilters = {}): Promise<AssessmentsReport> {
    return this.reports.assessments(filters);
  }
}

export class GetMoodReport {
  constructor(private readonly reports: ReportRepository) {}

  execute(filters: MoodReportFilters = {}): Promise<MoodReport> {
    return this.reports.mood(filters);
  }
}

export class GetCompaniesOverview {
  constructor(private readonly reports: ReportRepository) {}

  execute(filters: CompaniesOverviewFilters = {}): Promise<CompaniesOverviewReport> {
    return this.reports.companiesOverview(filters);
  }
}

export class GetCompanyPanel {
  constructor(private readonly reports: ReportRepository) {}

  execute(companyId: number): Promise<CompanyPanelReport> {
    return this.reports.companyPanel(companyId);
  }
}
