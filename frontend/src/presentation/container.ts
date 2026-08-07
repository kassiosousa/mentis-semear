import { RestoreSession } from '@/application/auth/useCases/RestoreSession';
import { SignIn } from '@/application/auth/useCases/SignIn';
import { SignOut } from '@/application/auth/useCases/SignOut';
import { CreateSeed } from '@/application/seed/useCases/CreateSeed';
import { ListSeeds } from '@/application/seed/useCases/ListSeeds';
import { HttpAuthRepository } from '@/infrastructure/auth/HttpAuthRepository';
import { AxiosHttpClient } from '@/infrastructure/http/AxiosHttpClient';
import { createApiClient } from '@/infrastructure/http/createApiClient';
import { HttpSeedRepository } from '@/infrastructure/seed/HttpSeedRepository';
import { BrowserSessionStorage } from '@/infrastructure/storage/BrowserSessionStorage';

const sessions = new BrowserSessionStorage();

const apiClient = createApiClient({
  sessions,
  onSessionExpired: () => {
    window.dispatchEvent(new CustomEvent('mentis:session-expired'));
  },
});

const http = new AxiosHttpClient(apiClient);

const authRepository = new HttpAuthRepository(http);
const seedRepository = new HttpSeedRepository(http);

export const container = {
  sessions,
  auth: {
    signIn: new SignIn(authRepository, sessions),
    signOut: new SignOut(authRepository, sessions),
    restoreSession: new RestoreSession(authRepository, sessions),
  },
  seeds: {
    list: new ListSeeds(seedRepository),
    create: new CreateSeed(seedRepository),
  },
} as const;

export type Container = typeof container;