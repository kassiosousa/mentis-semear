export interface Seed {
  id: number | null;
  title: string;
  content: string;
  plantedAt: string;
}

export interface NewSeed {
  title: string;
  content: string;
}