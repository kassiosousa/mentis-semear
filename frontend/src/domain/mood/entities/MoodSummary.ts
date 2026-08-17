export const MOOD_SCORES = [1, 2, 3, 4, 5] as const;

export type MoodScore = (typeof MOOD_SCORES)[number];

export const MOOD_LABELS: Record<MoodScore, string> = {
  1: 'Muito mal',
  2: 'Mal',
  3: 'Neutro',
  4: 'Bem',
  5: 'Muito bem',
};

export interface SectorMood {
  sectorId: number | null;
  sectorName: string | null;
  total: number;
  average: number;
}

export interface MoodSummary {
  total: number;
  average: number | null;
  distribution: Record<MoodScore, number>;
  bySector: SectorMood[];
}

export function moodLabel(score: number | null): string {
  return score === null ? '—' : (MOOD_LABELS[score as MoodScore] ?? '—');
}

export function moodScoreFromAverage(average: number | null | undefined): MoodScore | null {
  if (average == null || Number.isNaN(average) || average <= 0) return null;

  const rounded = Math.round(average);

  return Math.min(5, Math.max(1, rounded)) as MoodScore;
}

export function moodOfSector(summary: MoodSummary | undefined, sectorId: number): SectorMood | null {
  if (summary === undefined) return null;

  return summary.bySector.find((entry) => entry.sectorId === sectorId) ?? null;
}
