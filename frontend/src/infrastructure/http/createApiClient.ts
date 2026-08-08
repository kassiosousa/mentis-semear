import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type { AuthTokens } from '@/domain/auth/entities/AuthSession';
import type { SessionStorage } from '@/domain/auth/repositories/SessionStorage';
import { toAuthTokens } from '@/infrastructure/auth/authMappers';
import { unwrap } from '@/infrastructure/http/envelope';
import { toAppError } from '@/infrastructure/http/httpErrors';
import { env } from '@/config/env';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    retriedAfterRefresh?: boolean;
  }
}

export const REFRESH_PATH = '/auth/refresh';

export interface ApiClientOptions {
  sessions: SessionStorage;
  onSessionExpired?: () => void;
  baseUrl?: string;
  timeoutMs?: number;
}

export function createApiClient({
  sessions,
  onSessionExpired,
  baseUrl = env.apiUrl,
  timeoutMs = env.requestTimeoutMs,
}: ApiClientOptions): AxiosInstance {
  const defaults = {
    baseURL: baseUrl,
    timeout: timeoutMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const instance = axios.create(defaults);
  const refreshClient = axios.create(defaults);

  let refreshInFlight: Promise<AuthTokens> | null = null;

  function renewTokens(refreshToken: string): Promise<AuthTokens> {
    refreshInFlight ??= refreshClient
      .post<unknown>(REFRESH_PATH, { refresh_token: refreshToken })
      .then((response) => toAuthTokens(unwrap(response.data)))
      .finally(() => {
        refreshInFlight = null;
      });

    return refreshInFlight;
  }

  function endSession(): void {
    sessions.clear();
    onSessionExpired?.();
  }

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (config.skipAuth === true) return config;

    const accessToken = sessions.read()?.tokens.accessToken;
    if (accessToken != null && accessToken !== '') {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!(error instanceof AxiosError) || error.response?.status !== 401) {
        throw toAppError(error);
      }

      const config = error.config;
      const refreshToken = sessions.read()?.tokens.refreshToken ?? null;

      const cannotRetry =
        config === undefined ||
        config.skipAuth === true ||
        config.retriedAfterRefresh === true ||
        refreshToken === null ||
        refreshToken === '';

      if (cannotRetry) {
        endSession();
        throw toAppError(error);
      }

      try {
        const tokens = await renewTokens(refreshToken);
        sessions.saveTokens(tokens);

        config.retriedAfterRefresh = true;
        config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);

        return await instance.request(config);
      } catch (refreshError) {
        endSession();
        throw toAppError(refreshError);
      }
    },
  );

  return instance;
}