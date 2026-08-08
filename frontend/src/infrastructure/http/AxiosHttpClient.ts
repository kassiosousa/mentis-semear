import type { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import type { HttpClient, HttpRequestOptions } from '@/infrastructure/http/HttpClient';

export class AxiosHttpClient implements HttpClient {
  constructor(private readonly instance: AxiosInstance) {}

  get<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  delete<T>(path: string, options?: HttpRequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: Method,
    url: string,
    data?: unknown,
    options: HttpRequestOptions = {},
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url,
      data,
      params: options.params,
      headers: options.headers,
      signal: options.signal,
      skipAuth: options.skipAuth,
    };

    const response = await this.instance.request<T>(config);

    return response.data;
  }
}