import type { HttpClient, HttpResponse } from '../../src/lib/utils/http.js';
import { IranSmsError } from '../../src/lib/error.js';
import type { SmsProviderName } from '../../src/lib/types.js';

export function createMockHttpClient(): jest.Mocked<HttpClient> {
  return {
    request: jest.fn(),
  } as unknown as jest.Mocked<HttpClient>;
}

export function mockSuccess<T>(data: T, status = 200): HttpResponse<T> {
  return { data, status, headers: {} };
}

export function throwProviderError(provider: SmsProviderName, message: string): never {
  throw new IranSmsError({ message, code: 'PROVIDER_ERROR', provider });
}
