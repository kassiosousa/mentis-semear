function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  apiUrl: normalizeBaseUrl(import.meta.env.VITE_API_URL ?? '/api'),
  requestTimeoutMs: toPositiveInt(import.meta.env.VITE_API_TIMEOUT_MS, 15_000),
  isDev: import.meta.env.DEV,
} as const;