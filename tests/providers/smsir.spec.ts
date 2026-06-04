import { SmsIrProvider } from '../../src/lib/providers/smsir.provider.js';
import { IranSmsError } from '../../src/lib/error.js';
import { createMockHttpClient, mockSuccess } from '../helpers/mock-http.js';
import type { SmsIrConfig } from '../../src/lib/types.js';

const config: SmsIrConfig = { provider: 'smsir', apiKey: 'test-key', lineNumber: 300000000000 };

type WithHttp = { http: ReturnType<typeof createMockHttpClient> };

let mockHttp: ReturnType<typeof createMockHttpClient>;
let provider: SmsIrProvider;

beforeEach(() => {
  mockHttp = createMockHttpClient();
  provider = new SmsIrProvider(config, 5000);
  (provider as unknown as WithHttp).http = mockHttp;
});

describe('send — single recipient', () => {
  it('returns single SendResult', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 1, message: 'ok', data: [{ messageId: 111 }] }),
    );
    const result = await provider.send({ to: '09121234567', message: 'test' });
    expect(Array.isArray(result)).toBe(false);
    if (!Array.isArray(result)) {
      expect(result.messageId).toBe(111);
      expect(result.provider).toBe('smsir');
    }
    expect((mockHttp.request.mock.calls[0]?.[0] as { url: string }).url).toContain('send/bulk');
  });
});

describe('send — bulk recipients', () => {
  it('returns array of SendResults', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 1, message: 'ok', data: [{ messageId: 1 }, { messageId: 2 }] }),
    );
    const result = await provider.send({ to: ['09121234567', '09361234567'], message: 'bulk' });
    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[]).length).toBe(2);
  });
});

describe('sendPattern', () => {
  it('returns SendResult and posts to send/verify with parameters array', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 1, message: 'ok', data: { messageId: 222 } }),
    );
    const result = await provider.sendPattern({ to: '09121234567', templateId: '42', variables: { code: '9999' } });
    expect(result.messageId).toBe(222);
    const call = mockHttp.request.mock.calls[0]?.[0] as { url: string; body: Record<string, unknown> };
    expect(call.url).toContain('send/verify');
    expect(Array.isArray(call.body['parameters'])).toBe(true);
  });
});

describe('getStatus', () => {
  const cases: [number, string][] = [
    [1, 'delivered'],
    [2, 'failed'],
    [0, 'pending'],
    [99, 'unknown'],
  ];

  it.each(cases)('maps deliveryState %i → %s', async (state, expected) => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 1, message: 'ok', data: { messageId: 1, deliveryState: state } }),
    );
    const result = await provider.getStatus({ messageId: 1 });
    expect(result.status).toBe(expected);
  });
});

describe('getCredit', () => {
  it('returns balance in rial', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 1, message: 'ok', data: 75000 }),
    );
    const result = await provider.getCredit();
    expect(result.balance).toBe(75000);
    expect(result.unit).toBe('rial');
  });
});

describe('error handling', () => {
  it('throws IranSmsError PROVIDER_ERROR when status !== 1', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ status: 0, message: 'Invalid API key', data: null }),
    );
    const error = await provider.send({ to: '09121234567', message: 'test' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(IranSmsError);
    expect((error as IranSmsError).code).toBe('PROVIDER_ERROR');
  });
});
