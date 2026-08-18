export interface Sector {
  id: number;
  companyId: number;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SectorInput {
  name: string;
  companyId?: number;
}

export function matchesTerm(sector: Sector, term: string): boolean {
  const normalized = term.trim().toLowerCase();

  if (normalized === '') return true;

  return sector.name.toLowerCase().includes(normalized);
}
