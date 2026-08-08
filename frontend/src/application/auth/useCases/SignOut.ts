import type { AuthRepository } from '@/domain/auth/repositories/AuthRepository';
import type { SessionStorage } from '@/domain/auth/repositories/SessionStorage';

export class SignOut {
  constructor(
    private readonly auth: AuthRepository,
    private readonly sessions: SessionStorage,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.auth.signOut();
    } finally {
      this.sessions.clear();
    }
  }
}