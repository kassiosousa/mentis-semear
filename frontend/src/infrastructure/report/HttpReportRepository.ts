import type { MoodScore } from '@/domain/mood/entities/MoodSummary';
import { MOOD_SCORES } from '@/domain/mood/entities/MoodSummary';
import type {
  AssessmentReportRow,
  AssessmentsReportSummary,
  CheckInReportRow,
  CheckInsReportSummary,
  CompaniesOverviewSummary,
  CompanyOverviewRow,
  CompanyPanelReport,
  LabelCount,
  MoodDistributionPoint,
  MoodReportRow,
  MoodReportSummary,
  ScoreCount,
  SectorCount,
  SectorMoodPoint,
  TrendPoint,
  WorkshopReportRow,
  WorkshopsReportSummary,
} from '@/domain/report/entities/Report';
import { AGE_BRACKETS } from '@/domain/report/entities/Report';
import type {
  AssessmentReportFilters,
  AssessmentsReport,
  CheckInReportFilters,
  CheckInsReport,
  CompaniesOverviewFilters,
  CompaniesOverviewReport,
  MoodReport,
  MoodReportFilters,
  ReportPage,
  ReportRepository,
  WorkshopReportFilters,
  WorkshopsReport,
} from '@/domain/report/repositories/ReportRepository';
import { unwrap } from '@/infrastructure/http/envelope';
import type { HttpClient, QueryParams } from '@/infrastructure/http/HttpClient';

const NO_SECTOR_LABEL = 'Sem setor';

interface ApiPaginator<TModel> {
  data?: TModel[];
  current_page?: number;
  per_page?: number | string;
  last_page?: number;
  total?: number;
}

type ApiItems<TModel> = ApiPaginator<TModel> | TModel[];

type ApiCountMap = Record<string, number | string> | unknown[];

interface ApiSectorCount {
  sector_id?: number | null;
  sector?: string | null;
  total?: number | string;
}

interface ApiSectorMood extends ApiSectorCount {
  average?: number | string | null;
}

interface ApiTrendPoint {
  date?: string | null;
  total?: number | string;
  average?: number | string | null;
}

interface ApiWorkshopRow {
  id: number;
  datetime?: string | null;
  company?: string | null;
  facilitator?: string | null;
  address?: string | null;
  check_ins?: number | string;
  assessments?: number | string;
  avg_score?: number | string | null;
  created_at?: string | null;
}

interface ApiCheckInRow {
  id: number;
  name?: string | null;
  position?: string | null;
  sector_id?: number | null;
  gender?: string | null;
  workshop_id?: number | null;
  created_at?: string | null;
}

interface ApiAssessmentRow {
  id: number;
  workshop_id?: number | null;
  score?: number | string | null;
  suggestions?: string | null;
  created_at?: string | null;
}

interface ApiMoodRow {
  id: number;
  company_id?: number | null;
  sector_id?: number | null;
  mood?: number | string | null;
  created_at?: string | null;
}

interface ApiCompanyOverviewRow {
  company_id?: number;
  company?: string | null;
  workshops?: number | string;
  check_ins?: number | string;
  avg_score?: number | string | null;
}

interface ApiMoodSummary {
  total?: number | string;
  average?: number | string | null;
  distribution?: ApiCountMap;
  by_sector?: ApiSectorMood[];
  trend?: ApiTrendPoint[];
}

interface ApiResponse<TSummary, TModel> {
  summary?: TSummary;
  items?: ApiItems<TModel>;
}

interface ApiCompanyPanel {
  company?: { id?: number; name?: string | null };
  workshops?: number | string;
  check_ins?: number | string;
  satisfaction?: { total?: number | string; average?: number | string | null };
  mood?: ApiMoodSummary;
}

function toInt(value: number | string | null | undefined): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function toDecimal(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function entriesOf(map: ApiCountMap | undefined): [string, number][] {
  if (map === undefined || Array.isArray(map)) return [];

  return Object.entries(map).map(([key, value]) => [key, toInt(value)]);
}

function toLabelCounts(map: ApiCountMap | undefined): LabelCount[] {
  return entriesOf(map).map(([label, total]) => ({ label, total }));
}

function toSectorCounts(rows: ApiSectorCount[] | undefined): SectorCount[] {
  return (rows ?? []).map((row) => ({
    sectorId: row.sector_id ?? null,
    sector: row.sector ?? NO_SECTOR_LABEL,
    total: toInt(row.total),
  }));
}

function toSectorMoods(rows: ApiSectorMood[] | undefined): SectorMoodPoint[] {
  return (rows ?? []).map((row) => ({
    sectorId: row.sector_id ?? null,
    sector: row.sector ?? NO_SECTOR_LABEL,
    total: toInt(row.total),
    average: toDecimal(row.average),
  }));
}

function toTrend(rows: ApiTrendPoint[] | undefined): TrendPoint[] {
  return (rows ?? [])
    .filter((row): row is ApiTrendPoint & { date: string } => typeof row.date === 'string')
    .map((row) => ({
      date: row.date,
      total: toInt(row.total),
      average: toDecimal(row.average),
    }));
}

function toAgeCounts(map: ApiCountMap | undefined): LabelCount[] {
  const counts = new Map(entriesOf(map));

  return AGE_BRACKETS.map((label) => ({ label, total: counts.get(label) ?? 0 }));
}

function toHistogram(map: ApiCountMap | undefined): ScoreCount[] {
  const counts = new Map(entriesOf(map));

  return Array.from({ length: 11 }, (_, score) => ({
    score,
    total: counts.get(String(score)) ?? 0,
  }));
}

function toDistribution(map: ApiCountMap | undefined): MoodDistributionPoint[] {
  const counts = new Map(entriesOf(map));

  return MOOD_SCORES.map((mood) => ({
    mood: mood as MoodScore,
    total: counts.get(String(mood)) ?? 0,
  }));
}

function toMoodSummaryBase(summary: ApiMoodSummary | undefined): Omit<MoodReportSummary, 'trend'> {
  return {
    total: toInt(summary?.total),
    average: toDecimal(summary?.average),
    distribution: toDistribution(summary?.distribution),
    bySector: toSectorMoods(summary?.by_sector),
  };
}

function toPage<TModel, TRow>(
  items: ApiItems<TModel> | undefined,
  map: (model: TModel) => TRow,
): ReportPage<TRow> {
  if (items === undefined) {
    return { rows: [], currentPage: 1, perPage: 0, lastPage: 1, total: 0 };
  }

  if (Array.isArray(items)) {
    return {
      rows: items.map(map),
      currentPage: 1,
      perPage: items.length,
      lastPage: 1,
      total: items.length,
    };
  }

  const models = items.data ?? [];
  const perPage = toInt(items.per_page) || models.length;
  const total = items.total ?? models.length;
  const lastPage =
    items.last_page != null && items.last_page > 0
      ? items.last_page
      : Math.max(1, perPage > 0 ? Math.ceil(total / perPage) : 1);

  return { rows: models.map(map), currentPage: items.current_page ?? 1, perPage, lastPage, total };
}

function periodParams(filters: {
  dateFrom?: string;
  dateTo?: string;
  timeFrom?: string;
  timeTo?: string;
  page?: number;
  perPage?: number;
}): QueryParams {
  return {
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    time_from: filters.timeFrom,
    time_to: filters.timeTo,
    page: filters.page,
    per_page: filters.perPage,
  };
}

function toWorkshopRow(model: ApiWorkshopRow): WorkshopReportRow {
  return {
    id: model.id,
    datetime: model.datetime ?? null,
    company: model.company ?? null,
    facilitator: model.facilitator ?? null,
    address: model.address ?? null,
    checkIns: toInt(model.check_ins),
    assessments: toInt(model.assessments),
    avgScore: toDecimal(model.avg_score),
    createdAt: model.created_at ?? null,
  };
}

function toCheckInRow(model: ApiCheckInRow): CheckInReportRow {
  return {
    id: model.id,
    name: model.name ?? null,
    position: model.position ?? null,
    sectorId: model.sector_id ?? null,
    gender: model.gender ?? null,
    workshopId: model.workshop_id ?? null,
    createdAt: model.created_at ?? null,
  };
}

function toAssessmentRow(model: ApiAssessmentRow): AssessmentReportRow {
  return {
    id: model.id,
    workshopId: model.workshop_id ?? null,
    score: toDecimal(model.score),
    suggestions: model.suggestions ?? null,
    createdAt: model.created_at ?? null,
  };
}

function toMoodRow(model: ApiMoodRow): MoodReportRow {
  return {
    id: model.id,
    companyId: model.company_id ?? null,
    sectorId: model.sector_id ?? null,
    mood: toDecimal(model.mood),
    createdAt: model.created_at ?? null,
  };
}

function toCompanyOverviewRow(model: ApiCompanyOverviewRow): CompanyOverviewRow {
  return {
    companyId: toInt(model.company_id),
    company: model.company ?? '—',
    workshops: toInt(model.workshops),
    checkIns: toInt(model.check_ins),
    avgScore: toDecimal(model.avg_score),
  };
}

export class HttpReportRepository implements ReportRepository {
  constructor(private readonly http: HttpClient) {}

  async workshops(filters: WorkshopReportFilters = {}): Promise<WorkshopsReport> {
    const payload = await this.http.get<
      ApiResponse<
        {
          total_workshops?: number | string;
          total_check_ins?: number | string;
          avg_score_geral?: number | string | null;
        },
        ApiWorkshopRow
      >
    >('/reports/workshops', {
      params: {
        ...periodParams(filters),
        company_id: filters.companyId,
        facilitator_id: filters.facilitatorId,
        min_score: filters.minScore,
        max_score: filters.maxScore,
        has_diary: filters.hasDiary,
      },
    });

    const summary: WorkshopsReportSummary = {
      totalWorkshops: toInt(payload.summary?.total_workshops),
      totalCheckIns: toInt(payload.summary?.total_check_ins),
      avgScore: toDecimal(payload.summary?.avg_score_geral),
    };

    return { summary, page: toPage(payload.items, toWorkshopRow) };
  }

  async checkIns(filters: CheckInReportFilters = {}): Promise<CheckInsReport> {
    const payload = await this.http.get<
      ApiResponse<
        {
          total?: number | string;
          by_sector?: ApiSectorCount[];
          by_gender?: ApiCountMap;
          by_age?: ApiCountMap;
          lgpd_consent_rate?: number | string | null;
        },
        ApiCheckInRow
      >
    >('/reports/check-ins', {
      params: {
        ...periodParams(filters),
        company_id: filters.companyId,
        workshop_id: filters.workshopId,
        sector_id: filters.sectorId,
      },
    });

    const summary: CheckInsReportSummary = {
      total: toInt(payload.summary?.total),
      bySector: toSectorCounts(payload.summary?.by_sector),
      byGender: toLabelCounts(payload.summary?.by_gender),
      byAge: toAgeCounts(payload.summary?.by_age),
      lgpdConsentRate: toDecimal(payload.summary?.lgpd_consent_rate),
    };

    return { summary, page: toPage(payload.items, toCheckInRow) };
  }

  async assessments(filters: AssessmentReportFilters = {}): Promise<AssessmentsReport> {
    const payload = await this.http.get<
      ApiResponse<
        {
          total?: number | string;
          average?: number | string | null;
          histogram?: ApiCountMap;
          nps?: {
            promoters?: number | string;
            passives?: number | string;
            detractors?: number | string;
            score?: number | string | null;
          };
          trend?: ApiTrendPoint[];
        },
        ApiAssessmentRow
      >
    >('/reports/assessments', {
      params: {
        ...periodParams(filters),
        company_id: filters.companyId,
        workshop_id: filters.workshopId,
      },
    });

    const summary: AssessmentsReportSummary = {
      total: toInt(payload.summary?.total),
      average: toDecimal(payload.summary?.average),
      histogram: toHistogram(payload.summary?.histogram),
      nps: {
        promoters: toInt(payload.summary?.nps?.promoters),
        passives: toInt(payload.summary?.nps?.passives),
        detractors: toInt(payload.summary?.nps?.detractors),
        score: toDecimal(payload.summary?.nps?.score),
      },
      trend: toTrend(payload.summary?.trend),
    };

    return { summary, page: toPage(payload.items, toAssessmentRow) };
  }

  async mood(filters: MoodReportFilters = {}): Promise<MoodReport> {
    const payload = await this.http.get<ApiResponse<ApiMoodSummary, ApiMoodRow>>('/reports/mood', {
      params: {
        ...periodParams(filters),
        company_id: filters.companyId,
        sector_id: filters.sectorId,
      },
    });

    const summary: MoodReportSummary = {
      ...toMoodSummaryBase(payload.summary),
      trend: toTrend(payload.summary?.trend),
    };

    return { summary, page: toPage(payload.items, toMoodRow) };
  }

  async companiesOverview(
    filters: CompaniesOverviewFilters = {},
  ): Promise<CompaniesOverviewReport> {
    const payload = await this.http.get<
      ApiResponse<
        {
          total_companies?: number | string;
          total_workshops?: number | string;
          total_check_ins?: number | string;
          avg_score_geral?: number | string | null;
        },
        ApiCompanyOverviewRow
      >
    >('/reports/companies-overview', { params: periodParams(filters) });

    const summary: CompaniesOverviewSummary = {
      totalCompanies: toInt(payload.summary?.total_companies),
      totalWorkshops: toInt(payload.summary?.total_workshops),
      totalCheckIns: toInt(payload.summary?.total_check_ins),
      avgScore: toDecimal(payload.summary?.avg_score_geral),
    };

    return { summary, page: toPage(payload.items, toCompanyOverviewRow) };
  }

  async companyPanel(companyId: number): Promise<CompanyPanelReport> {
    const payload = await this.http.get<unknown>(`/reports/company/${companyId}`);
    const model = unwrap<ApiCompanyPanel>(payload);

    return {
      companyId: model.company?.id ?? companyId,
      company: model.company?.name ?? '—',
      workshops: toInt(model.workshops),
      checkIns: toInt(model.check_ins),
      satisfaction: {
        total: toInt(model.satisfaction?.total),
        average: toDecimal(model.satisfaction?.average),
      },
      mood: toMoodSummaryBase(model.mood),
    };
  }
}
