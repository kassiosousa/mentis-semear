// Pure domain entity — no framework, no HTTP, no React.
export interface Seed {
  id: number | null;
  title: string;
  content: string;
  plantedAt: string; // ISO-8601
}

export interface NewSeed {
  title: string;
  content: string;
}
