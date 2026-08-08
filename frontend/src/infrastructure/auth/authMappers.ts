import type { AuthTokens } from '@/domain/auth/entities/AuthSession';
import type { User } from '@/domain/auth/entities/User';
import { DEFAULT_USER_TYPE, isUserType } from '@/domain/auth/entities/User';

export interface TokensApiModel {
  access_token?: string;
  token?: string;
  refresh_token?: string | null;
  expires_at?: string | null;
  expires_in?: number | null;
}

export interface UserApiModel {
  id: string;
  name: string;
  email: string;
  type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SessionApiModel extends TokensApiModel {
  user: UserApiModel;
}

function resolveExpiration(model: TokensApiModel, now: Date): string | null {
  if (model.expires_at != null) return model.expires_at;
  if (model.expires_in == null) return null;

  return new Date(now.getTime() + model.expires_in * 1000).toISOString();
}

export function toAuthTokens(model: TokensApiModel, now: Date = new Date()): AuthTokens {
  return {
    accessToken: model.access_token ?? model.token ?? '',
    refreshToken: model.refresh_token ?? null,
    expiresAt: resolveExpiration(model, now),
  };
}

export function toUser(model: UserApiModel): User {
  return {
    id: model.id,
    name: model.name,
    email: model.email,
    type: isUserType(model.type) ? model.type : DEFAULT_USER_TYPE,
    createdAt: model.created_at ?? null,
    updatedAt: model.updated_at ?? null,
  };
}