import { FarazSmsProvider } from '../../src/lib/providers/farazsms.provider.js';
import { IranSmsError } from '../../src/lib/error.js';
import { createMockHttpClient, mockSuccess } from '../helpers/mock-http.js';
import type { FarazSmsConfig } from '../../src/lib/types.js';

const config: FarazSmsConfig = {
  provider: 'farazsms',
  username: 'user',
  password: 'pass',
  lineNumber: '3000',
};

type WithHttp = { http: ReturnType<typeof createMockHttpClient> };

let mockHttp: ReturnType<typeof createMockHttpClient>;
let provider: FarazSmsProvider;

beforeEach(() => {
  mockHttp = createMockHttpClient();
  provider = new FarazSmsProvider(config, 5000);
  (provider as unknown as WithHttp).http = mockHttp;
});

describe('send — single recipient', () => {
  it('returns single SendResult with correct body', async () => {
    mockHttp.request.mockResolvedValueOnce(mockSuccess({ status: 'success', data: ['msg-id-1'] }));
    const result = await provider.send({ to: '09121234567', message: 'test' });
    expect(Array.isArray(result)).toBe(false);
    if (!Array.isArray(result)) expect(result.messageId).toBe('msg-id-1');
    const body = (mockHttp.request.mock.calls[0]?.[0] as { body: Record<string, unknown> }).body;
    expect(body['method']).toBe('sms');
    expect(body['from']).toBe('3000');
  });
});

describe('send — bulk recipients', () => {
  it('returns array of SendResults', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 'success', data: ['id-1', 'id-2'] }),
    );
    const result = await provider.send({ to: ['09121234567', '09361234567'], message: 'bulk' });
    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[]).length).toBe(2);
  });
});

describe('sendPattern', () => {
  it('posts with method pattern, pattern_code, and input_data as single-key objects', async () => {
    mockHttp.request.mockResolvedValueOnce(mockSuccess({ status: 'success', data: ['pid-1'] }));
    await provider.sendPattern({
      to: '09121234567',
      templateId: 'tpl-99',
      variables: { name: 'Ali', code: '1234' },
    });
    const body = (mockHttp.request.mock.calls[0]?.[0] as { body: Record<string, unknown> }).body;
    expect(body['method']).toBe('pattern');
    expect(body['pattern_code']).toBe('tpl-99');
    const inputData = body['input_data'] as Record<string, string>[];
    expect(Array.isArray(inputData)).toBe(true);
    expect(Object.keys(inputData[0] ?? {}).length).toBe(1);
  });
});

describe('getStatus', () => {
  const cases: [string, string][] = [
    ['delivered', 'delivered'],
    ['failed', 'failed'],
    ['undelivered', 'failed'],
    ['pending', 'pending'],
    ['queued', 'pending'],
    ['unknown-xyz', 'unknown'],
  ];

  it.each(cases)('maps status "%s" → %s', async (apiStatus, expected) => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 'success', data: [{ status: apiStatus }] }),
    );
    const result = await provider.getStatus({ messageId: '1' });
    expect(result.status).toBe(expected);
  });
});

describe('getCredit', () => {
  it('returns balance in rial', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 'success', data: { credit: 100000 } }),
    );
    const result = await provider.getCredit();
    expect(result.balance).toBe(100000);
    expect(result.unit).toBe('rial');
  });
});

describe('error handling', () => {
  it('throws IranSmsError PROVIDER_ERROR when status === error', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 'error', error_code: 'AUTH_FAILED' }),
    );
    const error = await provider
      .send({ to: '09121234567', message: 'test' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(IranSmsError);
    expect((error as IranSmsError).code).toBe('PROVIDER_ERROR');
  });
});
