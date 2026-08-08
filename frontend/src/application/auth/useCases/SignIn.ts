import type { AuthSession, Credentials } from '@/domain/auth/entities/AuthSession';
import type { AuthRepository } from '@/domain/auth/repositories/AuthRepository';
import type { SessionStorage } from '@/domain/auth/repositories/SessionStorage';
import { ValidationError } from '@/domain/shared/errors/AppError';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class SignIn {
  constructor(
    private readonly auth: AuthRepository,
    private readonly sessions: SessionStorage,
  ) {}

  async execute(credentials: Credentials): Promise<AuthSession> {
    const email = credentials.email.trim().toLowerCase();

    const fields: Record<string, string[]> = {};
    if (!EMAIL_PATTERN.test(email)) fields.email = ['Informe um e-mail válido.'];
    if (credentials.password === '') fields.password = ['A senha é obrigatória.'];

    if (Object.keys(fields).length > 0) {
      throw new ValidationError('Dados inválidos.', fields);
    }

    const session = await this.auth.signIn({ email, password: credentials.password });
    this.sessions.save(session);

    return session;
  }
}