import type { AuthSession } from '@/domain/auth/entities/AuthSession';
import { isTokenExpired } from '@/domain/auth/entities/AuthSession';
import type { AuthRepository } from '@/domain/auth/repositories/AuthRepository';
import type { SessionStorage } from '@/domain/auth/repositories/SessionStorage';

export class RestoreSession {
  private pending: Promise<AuthSession | null> | null = null;

  constructor(
    private readonly auth: AuthRepository,
    private readonly sessions: SessionStorage,
  ) {}

  execute(): Promise<AuthSession | null> {
    this.pending ??= this.resolve().finally(() => {
      this.pending = null;
    });

    return this.pending;
  }

  private async resolve(): Promise<AuthSession | null> {
    const stored = this.sessions.read();
    if (stored === null) return null;

    if (isTokenExpired(stored.tokens) && stored.tokens.refreshToken === null) {
      this.sessions.clear();
      return null;
    }

    try {
      const user = await this.auth.me();
      const session: AuthSession = { user, tokens: stored.tokens };
      this.sessions.save(session);

      return session;
    } catch {
      this.sessions.clear();
      return null;
    }
  }
}