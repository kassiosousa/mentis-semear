import type { AuthSession, AuthTokens, Credentials } from '../entities/AuthSession';
import type { User } from '../entities/User';

export interface AuthRepository {
  signIn(credentials: Credentials): Promise<AuthSession>;
  signOut(): Promise<void>;
  me(): Promise<User>;
  refresh(refreshToken: string): Promise<AuthTokens>;
}