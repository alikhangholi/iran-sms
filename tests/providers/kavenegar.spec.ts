import { KavenegarProvider } from '../../src/lib/providers/kavenegar.provider.js';
import { IranSmsError } from '../../src/lib/error.js';
import { createMockHttpClient, mockSuccess } from '../helpers/mock-http.js';
import type { KavenegarConfig } from '../../src/lib/types.js';

const config: KavenegarConfig = {
  provider: 'kavenegar',
  apiKey: 'test-api-key',
  lineNumber: '10004346',
};

type WithHttp = { http: ReturnType<typeof createMockHttpClient> };

let mockHttp: ReturnType<typeof createMockHttpClient>;
let provider: KavenegarProvider;

beforeEach(() => {
  mockHttp = createMockHttpClient();
  provider = new KavenegarProvider(config, 5000);
  (provider as unknown as WithHttp).http = mockHttp;
});

describe('send — single recipient', () => {
  it('returns a single SendResult with queued status', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ return: { status: 200, message: 'ok' }, entries: [{ messageid: 123, status: 1 }] }),
    );
    const result = await provider.send({ to: '09121234567', message: 'test' });
    expect(Array.isArray(result)).toBe(false);
    if (!Array.isArray(result)) {
      expect(result.messageId).toBe(123);
      expect(result.provider).toBe('kavenegar');
      expect(result.status).toBe('queued');
    }
    expect(mockHttp.request.mock.calls).toHaveLength(1);
    expect((mockHttp.request.mock.calls[0]?.[0] as { url: string }).url).toContain('sms/send.json');
  });
});

describe('send — bulk recipients', () => {
  it('returns an array of SendResults', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ return: { status: 200, message: 'ok' }, entries: [{ messageid: 1, status: 1 }, { messageid: 2, status: 1 }] }),
    );
    const result = await provider.send({ to: ['09121234567', '09361234567'], message: 'bulk test' });
    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[]).length).toBe(2);
    expect((mockHttp.request.mock.calls[0]?.[0] as { url: string }).url).toContain('sms/sendarray.json');
  });
});

describe('sendPattern', () => {
  it('returns SendResult and passes token and template in body', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ return: { status: 200, message: 'ok' }, entries: [{ messageid: 456, status: 2 }] }),
    );
    const result = await provider.sendPattern({ to: '09121234567', templateId: 'verify', variables: { code: '1234' } });
    expect(result.messageId).toBe(456);
    const body = (mockHttp.request.mock.calls[0]?.[0] as { body: Record<string, unknown> }).body;
    expect(body['token']).toBe('1234');
    expect(body['template']).toBe('verify');
  });
});

describe('getStatus', () => {
  const cases: [number, string][] = [
    [10, 'delivered'],
    [20, 'failed'],
    [1,  'pending'],
    [99, 'unknown'],
  ];

  it.each(cases)('maps API status %i → %s', async (apiStatus, expected) => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ return: { status: 200, message: 'ok' }, entries: [{ messageid: 789, status: apiStatus }] }),
    );
    const result = await provider.getStatus({ messageId: 789 });
    expect(result.status).toBe(expected);
  });
});

describe('getCredit', () => {
  it('returns balance in rial', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ return: { status: 200, message: 'ok' }, entries: { remaincredit: 50000 } }),
    );
    const result = await provider.getCredit();
    expect(result.balance).toBe(50000);
    expect(result.unit).toBe('rial');
  });
});

describe('error handling', () => {
  it('wraps network error as IranSmsError with NETWORK_ERROR', async () => {
    mockHttp.request.mockRejectedValueOnce(new Error('connection refused'));
    const error = await provider.send({ to: '09121234567', message: 'test' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(IranSmsError);
    expect((error as IranSmsError).code).toBe('NETWORK_ERROR');
  });

  it('throws IranSmsError PROVIDER_ERROR when API return.status !== 200', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ return: { status: 401, message: 'Unauthorized' }, entries: [] }),
    );
    const error = await provider.send({ to: '09121234567', message: 'test' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(IranSmsError);
    expect((error as IranSmsError).code).toBe('PROVIDER_ERROR');
  });
});
