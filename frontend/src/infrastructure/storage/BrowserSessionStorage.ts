import type { AuthSession, AuthTokens } from '@/domain/auth/entities/AuthSession';
import type { SessionStorage } from '@/domain/auth/repositories/SessionStorage';

const DEFAULT_KEY = 'mentis.auth.session';

export class BrowserSessionStorage implements SessionStorage {
  private current: AuthSession | null;
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly key: string = DEFAULT_KEY,
    private readonly storage: Storage = window.localStorage,
  ) {
    this.current = this.readFromStorage();

    window.addEventListener('storage', (event) => {
      if (event.storageArea !== this.storage || event.key !== this.key) return;

      this.current = this.readFromStorage();
      this.emit();
    });
  }

  read(): AuthSession | null {
    return this.current;
  }

  save(session: AuthSession): void {
    this.current = session;
    this.storage.setItem(this.key, JSON.stringify(session));
    this.emit();
  }

  saveTokens(tokens: AuthTokens): void {
    if (this.current === null) return;

    this.save({ ...this.current, tokens });
  }

  clear(): void {
    if (this.current === null) return;

    this.current = null;
    this.storage.removeItem(this.key);
    this.emit();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private readFromStorage(): AuthSession | null {
    const raw = this.storage.getItem(this.key);
    if (raw === null) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<AuthSession>;
      if (parsed.user == null || parsed.tokens?.accessToken == null) {
        this.storage.removeItem(this.key);
        return null;
      }

      return parsed as AuthSession;
    } catch {
      this.storage.removeItem(this.key);
      return null;
    }
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}