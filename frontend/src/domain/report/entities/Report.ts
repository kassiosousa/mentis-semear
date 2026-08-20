import type { MoodScore } from '@/domain/mood/entities/MoodSummary';

export interface LabelCount {
  label: string;
  total: number;
}

export interface TrendPoint {
  date: string;
  total: number;
  average: number | null;
}

export interface WorkshopReportRow {
  id: number;
  datetime: string | null;
  company: string | null;
  facilitator: string | null;
  address: string | null;
  checkIns: number;
  assessments: number;
  avgScore: number | null;
  createdAt: string | null;
}

export interface WorkshopsReportSummary {
  totalWorkshops: number;
  totalCheckIns: number;
  avgScore: number | null;
}

export interface CheckInReportRow {
  id: number;
  name: string | null;
  position: string | null;
  sectorId: number | null;
  gender: string | null;
  workshopId: number | null;
  createdAt: string | null;
}

export interface SectorCount {
  sectorId: number | null;
  sector: string;
  total: number;
}

export interface CheckInsReportSummary {
  total: number;
  bySector: SectorCount[];
  byGender: LabelCount[];
  byAge: LabelCount[];
  lgpdConsentRate: number | null;
}

export interface AssessmentReportRow {
  id: number;
  workshopId: number | null;
  score: number | null;
  suggestions: string | null;
  createdAt: string | null;
}

export interface ScoreCount {
  score: number;
  total: number;
}

export interface NpsBreakdown {
  promoters: number;
  passives: number;
  detractors: number;
  score: number | null;
}

export interface AssessmentsReportSummary {
  total: number;
  average: number | null;
  histogram: ScoreCount[];
  nps: NpsBreakdown;
  trend: TrendPoint[];
}

export interface MoodReportRow {
  id: number;
  companyId: number | null;
  sectorId: number | null;
  mood: number | null;
  createdAt: string | null;
}

export interface MoodDistributionPoint {
  mood: MoodScore;
  total: number;
}

export interface SectorMoodPoint {
  sectorId: number | null;
  sector: string;
  total: number;
  average: number | null;
}

export interface MoodReportSummary {
  total: number;
  average: number | null;
  distribution: MoodDistributionPoint[];
  bySector: SectorMoodPoint[];
  trend: TrendPoint[];
}

export interface CompanyOverviewRow {
  companyId: number;
  company: string;
  workshops: number;
  checkIns: number;
  avgScore: number | null;
}

export interface CompaniesOverviewSummary {
  totalCompanies: number;
  totalWorkshops: number;
  totalCheckIns: number;
  avgScore: number | null;
}

export interface CompanyPanelReport {
  companyId: number;
  company: string;
  workshops: number;
  checkIns: number;
  satisfaction: {
    total: number;
    average: number | null;
  };
  mood: Omit<MoodReportSummary, 'trend'>;
}

export const AGE_BRACKETS = ['<25', '25-34', '35-44', '45-54', '55+'] as const;
