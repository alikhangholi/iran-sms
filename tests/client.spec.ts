import { IranSms } from '../src/lib/client.js';
import { IranSmsError } from '../src/lib/error.js';
import type { IranSmsConfig, SendResult } from '../src/lib/types.js';

type MockAdapter = {
  send: jest.Mock;
  sendPattern: jest.Mock;
  getStatus: jest.Mock;
  getCredit: jest.Mock;
  providerName: string;
};

function makeMockAdapter(providerName = 'kavenegar'): MockAdapter {
  return {
    send: jest.fn(),
    sendPattern: jest.fn(),
    getStatus: jest.fn(),
    getCredit: jest.fn(),
    providerName,
  };
}

function injectAdapter(sms: IranSms, adapter: MockAdapter): void {
  (sms as unknown as { adapter: MockAdapter }).adapter = adapter;
}

describe('IranSms — provider instantiation', () => {
  it.each([
    ['kavenegar', { provider: 'kavenegar' as const, apiKey: 'k', lineNumber: '100' }],
    ['smsir',     { provider: 'smsir'     as const, apiKey: 'k', lineNumber: 100 }],
    ['farazsms',  { provider: 'farazsms'  as const, username: 'u', password: 'p', lineNumber: '100' }],
    ['ghasedak',  { provider: 'ghasedak'  as const, apiKey: 'k', lineNumber: '100' }],
  ])('instantiates %s and getProvider() returns correct name', (name, providerConfig) => {
    const sms = new IranSms({ provider: providerConfig });
    expect(sms.getProvider()).toBe(name);
  });

  it.each([
    ['melipayamak', { provider: 'melipayamak' as const, username: 'u', password: 'p', lineNumber: '100' }],
    ['ippanel',     { provider: 'ippanel'     as const, username: 'u', password: 'p', lineNumber: '100' }],
  ])('throws NOT_IMPLEMENTED for unimplemented provider %s', (_name, providerConfig) => {
    const config: IranSmsConfig = { provider: providerConfig };
    expect(() => new IranSms(config)).toThrow(IranSmsError);
    try {
      new IranSms(config);
      fail('should have thrown');
    } catch (e: unknown) {
      expect(e).toBeInstanceOf(IranSmsError);
      expect((e as IranSmsError).code).toBe('NOT_IMPLEMENTED');
    }
  });
});

describe('IranSms — safe mode', () => {
  const baseConfig: IranSmsConfig = { provider: { provider: 'kavenegar', apiKey: 'x', lineNumber: '100' }, safe: true };
  const sendParams = { to: '09121234567', message: 'hi' };

  it('safe: true + rejection → success: false with NETWORK_ERROR', async () => {
    const sms = new IranSms(baseConfig);
    const adapter = makeMockAdapter();
    adapter.send.mockRejectedValueOnce(new Error('network failure'));
    injectAdapter(sms, adapter);
    const result = await sms.send(sendParams);
    expect(result).toMatchObject({ success: false });
    if ('success' in result && !result.success) {
      expect(result.error.code).toBe('NETWORK_ERROR');
    }
  });

  it('safe: true + resolve → success: true with data', async () => {
    const sms = new IranSms(baseConfig);
    const adapter = makeMockAdapter();
    const sendResult: SendResult = { messageId: 1, provider: 'kavenegar', status: 'queued', rawResponse: null };
    adapter.send.mockResolvedValueOnce(sendResult);
    injectAdapter(sms, adapter);
    const result = await sms.send(sendParams);
    expect(result).toMatchObject({ success: true, data: sendResult });
  });

  it('safe: false (default) + rejection → throws IranSmsError', async () => {
    const sms = new IranSms({ provider: { provider: 'kavenegar', apiKey: 'x', lineNumber: '100' } });
    const adapter = makeMockAdapter();
    adapter.send.mockRejectedValueOnce(new IranSmsError({ message: 'fail', code: 'PROVIDER_ERROR', provider: 'kavenegar' }));
    injectAdapter(sms, adapter);
    await expect(sms.send(sendParams)).rejects.toThrow(IranSmsError);
  });
});

describe('IranSms — default config values', () => {
  it('timeout defaults — construction without timeout does not crash', () => {
    const sms = new IranSms({ provider: { provider: 'kavenegar', apiKey: 'x', lineNumber: '100' } });
    expect(sms.getProvider()).toBe('kavenegar');
  });

  it('safe defaults to false — injected rejecting adapter causes method to throw', async () => {
    const sms = new IranSms({ provider: { provider: 'kavenegar', apiKey: 'x', lineNumber: '100' } });
    const adapter = makeMockAdapter();
    adapter.send.mockRejectedValueOnce(new IranSmsError({ message: 'fail', code: 'TIMEOUT', provider: 'kavenegar' }));
    injectAdapter(sms, adapter);
    await expect(sms.send({ to: '09121234567', message: 'hi' })).rejects.toBeInstanceOf(IranSmsError);
  });
});
