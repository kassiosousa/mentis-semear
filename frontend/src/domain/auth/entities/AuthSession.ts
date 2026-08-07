import type { User } from './User';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

export interface Credentials {
  email: string;
  password: string;
}

const EXPIRATION_SKEW_MS = 30_000;

export function isTokenExpired(tokens: AuthTokens, now: Date = new Date()): boolean {
  if (tokens.expiresAt === null) return false;

  const expiresAt = Date.parse(tokens.expiresAt);
  if (Number.isNaN(expiresAt)) return false;

  return expiresAt - EXPIRATION_SKEW_MS <= now.getTime();
}