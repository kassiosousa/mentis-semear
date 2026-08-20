export interface MoodEntry {
  id: number;
  companyId: number;
  sectorId: number | null;
  mood: number;
  description: string | null;
  createdAt: string | null;
}
