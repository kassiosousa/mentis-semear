export interface Workshop {
  id: number;
  companyId: number;
  creatorId: string;
  facilitatorId: string | null;
  datetime: string;
  address: string;
  checkinLink: string | null;
  assessmentLink: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface PublicWorkshop {
  id: number;
  datetime: string;
  address: string;
  company: string;
}

export interface CheckIn {
  id: number;
  workshopId: number;
  name: string;
  position: string | null;
  sector: string | null;
  cpf: string | null;
  birthday: string | null;
  gender: string | null;
  celphone: string | null;
  email: string | null;
  lgpdRead: boolean;
  lgpdConsentAt: string | null;
  createdAt: string | null;
}

export interface Assessment {
  id: number;
  workshopId: number;
  score: number;
  suggestions: string | null;
  createdAt: string | null;
}

export function isPast(workshop: Workshop, now: Date = new Date()): boolean {
  const date = new Date(workshop.datetime);

  return !Number.isNaN(date.getTime()) && date.getTime() < now.getTime();
}

export function averageScore(assessments: readonly Assessment[]): number | null {
  if (assessments.length === 0) return null;

  const sum = assessments.reduce((total, assessment) => total + assessment.score, 0);

  return sum / assessments.length;
}
