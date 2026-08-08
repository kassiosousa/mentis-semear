import type { AuthSession, AuthTokens } from '../entities/AuthSession';

export interface SessionStorage {
  read(): AuthSession | null;
  save(session: AuthSession): void;
  saveTokens(tokens: AuthTokens): void;
  clear(): void;
  subscribe(listener: () => void): () => void;
}