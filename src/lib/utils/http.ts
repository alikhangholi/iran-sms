import { IranSmsError } from '../error.js';
import type { SmsProviderName } from '../types.js';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type HttpRequestOptions = {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  provider: SmsProviderName;
};

export type HttpResponse<T> = {
  data: T;
  status: number;
  headers: Record<string, string>;
};

export class HttpClient {
  constructor(private readonly defaultTimeout: number = 10000) {}

  async request<T>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    const timeout = options.timeout ?? this.defaultTimeout;
    const controller = new AbortController();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    };

    const timer = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      let response: Response;
      try {
        response = await fetch(options.url, {
          method: options.method,
          headers,
          signal: controller.signal,
          ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
        });
      } catch (thrown: unknown) {
        if (thrown instanceof Error && thrown.name === 'AbortError') {
          throw new IranSmsError({
            message: `Request timed out after ${timeout}ms`,
            code: 'TIMEOUT',
            provider: options.provider,
          });
        }
        throw IranSmsError.from(thrown, options.provider);
      }

      if (!response.ok) {
        let rawResponse: unknown;
        try {
          rawResponse = await response.json();
        } catch {
          rawResponse = await response.text();
        }
        throw new IranSmsError({
          message: `Provider returned HTTP ${response.status}`,
          code: 'PROVIDER_ERROR',
          provider: options.provider,
          statusCode: response.status,
          rawResponse,
        });
      }

      const raw: unknown = await response.json();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        // Provider responses are validated by each adapter.
        data: raw as T,
        status: response.status,
        headers: responseHeaders,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
