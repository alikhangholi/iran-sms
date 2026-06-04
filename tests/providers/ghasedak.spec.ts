import { GhasedakProvider } from '../../src/lib/providers/ghasedak.provider.js';
import { IranSmsError } from '../../src/lib/error.js';
import { createMockHttpClient, mockSuccess } from '../helpers/mock-http.js';
import type { GhasedakConfig } from '../../src/lib/types.js';

const config: GhasedakConfig = { provider: 'ghasedak', apiKey: 'test-key', lineNumber: '5000' };

type WithHttp = { http: ReturnType<typeof createMockHttpClient> };

let mockHttp: ReturnType<typeof createMockHttpClient>;
let provider: GhasedakProvider;

beforeEach(() => {
  mockHttp = createMockHttpClient();
  provider = new GhasedakProvider(config, 5000);
  (provider as unknown as WithHttp).http = mockHttp;
});

describe('send — single recipient', () => {
  it('returns single SendResult, calls SendSingleSMS', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ result: { code: 200, description: 'ok' }, items: [{ id: '333', status: 1 }] }),
    );
    const result = await provider.send({ to: '09121234567', message: 'test' });
    expect(Array.isArray(result)).toBe(false);
    if (!Array.isArray(result)) expect(result.messageId).toBe('333');
    expect((mockHttp.request.mock.calls[0]?.[0] as { url: string }).url).toContain('SendSingleSMS');
  });
});

describe('send — bulk recipients', () => {
  it('returns array of SendResults, calls SendBulkSMS', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({
        result: { code: 200, description: 'ok' },
        items: [
          { id: '1', status: 1 },
          { id: '2', status: 1 },
        ],
      }),
    );
    const result = await provider.send({ to: ['09121234567', '09361234567'], message: 'bulk' });
    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[]).length).toBe(2);
    expect((mockHttp.request.mock.calls[0]?.[0] as { url: string }).url).toContain('SendBulkSMS');
  });
});

describe('sendPattern', () => {
  it('returns SendResult with type 1 and param1 from first variable', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ result: { code: 200, description: 'ok' }, items: [{ id: '444', status: 1 }] }),
    );
    const result = await provider.sendPattern({
      to: '09121234567',
      templateId: 'otp',
      variables: { code: '5678' },
    });
    expect(result.messageId).toBe('444');
    const body = (mockHttp.request.mock.calls[0]?.[0] as { body: Record<string, unknown> }).body;
    expect(body['type']).toBe(1);
    expect(body['param1']).toBe('5678');
  });
});

describe('getStatus', () => {
  const cases: [number, string][] = [
    [1, 'delivered'],
    [2, 'failed'],
    [0, 'pending'],
    [5, 'unknown'],
  ];

  it.each(cases)('maps deliveryState %i → %s', async (state, expected) => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ result: { code: 200, description: 'ok' }, items: [{ deliveryState: state }] }),
    );
    const result = await provider.getStatus({ messageId: '333' });
    expect(result.status).toBe(expected);
  });
});

describe('getCredit', () => {
  it('returns balance in sms units', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ result: { code: 200, description: 'ok' }, items: [{ credit: 50 }] }),
    );
    const result = await provider.getCredit();
    expect(result.balance).toBe(50);
    expect(result.unit).toBe('sms');
  });
});

describe('error handling', () => {
  it('throws IranSmsError PROVIDER_ERROR when result.code !== 200', async () => {
    mockHttp.request.mockResolvedValueOnce(
      mockSuccess({ result: { code: 401, description: 'Unauthorized' }, items: [] }),
    );
    const error = await provider
      .send({ to: '09121234567', message: 'test' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(IranSmsError);
    expect((error as IranSmsError).code).toBe('PROVIDER_ERROR');
  });
});
