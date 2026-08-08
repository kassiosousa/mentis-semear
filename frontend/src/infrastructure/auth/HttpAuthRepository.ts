import type { AuthSession, AuthTokens, Credentials } from '@/domain/auth/entities/AuthSession';
import type { User } from '@/domain/auth/entities/User';
import type { AuthRepository } from '@/domain/auth/repositories/AuthRepository';
import { toAuthTokens, toUser, type SessionApiModel, type TokensApiModel, type UserApiModel } from '@/infrastructure/auth/authMappers';
import { unwrap } from '@/infrastructure/http/envelope';
import { REFRESH_PATH } from '@/infrastructure/http/createApiClient';
import type { HttpClient } from '@/infrastructure/http/HttpClient';

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly http: HttpClient) {}

  async signIn(credentials: Credentials): Promise<AuthSession> {
    const payload = await this.http.post<unknown>('/auth/login', credentials, { skipAuth: true });
    const model = unwrap<SessionApiModel>(payload);

    return {
      user: toUser(model.user),
      tokens: toAuthTokens(model),
    };
  }

  async signOut(): Promise<void> {
    await this.http.post<unknown>('/auth/logout');
  }

  async me(): Promise<User> {
    const payload = await this.http.get<unknown>('/auth/me');

    return toUser(unwrap<UserApiModel>(payload));
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.http.post<unknown>(
      REFRESH_PATH,
      { refresh_token: refreshToken },
      { skipAuth: true },
    );

    return toAuthTokens(unwrap<TokensApiModel>(payload));
  }
}