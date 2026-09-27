export type QueryParams = Record<string, string | number | boolean | null | undefined>;

export interface HttpRequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipAuth?: boolean;
  responseType?: 'blob';
}

export interface HttpClient {
  get<T>(path: string, options?: HttpRequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T>;
  delete<T>(path: string, options?: HttpRequestOptions): Promise<T>;
}