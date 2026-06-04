import { IranSmsError } from '../src/lib/error.js';
import { ok, err, fromPromise } from '../src/lib/result.js';

describe('IranSmsError', () => {
  it('constructs with correct properties', () => {
    const e = new IranSmsError({
      message: 'bad key',
      code: 'INVALID_API_KEY',
      provider: 'kavenegar',
    });
    expect(e.message).toBe('bad key');
    expect(e.code).toBe('INVALID_API_KEY');
    expect(e.provider).toBe('kavenegar');
    expect(e.name).toBe('IranSmsError');
  });

  it('is instanceof IranSmsError', () => {
    const e = new IranSmsError({ message: 'x', code: 'PROVIDER_ERROR', provider: 'smsir' });
    expect(e).toBeInstanceOf(IranSmsError);
  });

  it('is instanceof Error', () => {
    const e = new IranSmsError({ message: 'x', code: 'PROVIDER_ERROR', provider: 'smsir' });
    expect(e).toBeInstanceOf(Error);
  });

  it('sets optional statusCode and rawResponse', () => {
    const raw = { detail: 'bad' };
    const e = new IranSmsError({
      message: 'x',
      code: 'PROVIDER_ERROR',
      provider: 'kavenegar',
      statusCode: 401,
      rawResponse: raw,
    });
    expect(e.statusCode).toBe(401);
    expect(e.rawResponse).toBe(raw);
  });

  it('from() returns same instance when given IranSmsError', () => {
    const original = new IranSmsError({ message: 'x', code: 'RATE_LIMITED', provider: 'ghasedak' });
    expect(IranSmsError.from(original, 'kavenegar')).toBe(original);
  });

  it('from() wraps plain Error with NETWORK_ERROR', () => {
    const native = new Error('connection refused');
    const wrapped = IranSmsError.from(native, 'smsir');
    expect(wrapped.code).toBe('NETWORK_ERROR');
    expect(wrapped.message).toBe('connection refused');
    expect(wrapped.provider).toBe('smsir');
  });

  it('from() wraps unknown value with UNKNOWN_ERROR', () => {
    const wrapped = IranSmsError.from('some string', 'farazsms');
    expect(wrapped.code).toBe('UNKNOWN_ERROR');
    expect(wrapped.message).toBe('An unknown error occurred');
  });
});

describe('ok / err / fromPromise', () => {
  it('ok() returns success result', () => {
    const result = ok(42);
    expect(result).toEqual({ success: true, data: 42 });
  });

  it('err() returns failure result', () => {
    const e = new IranSmsError({ message: 'fail', code: 'TIMEOUT', provider: 'kavenegar' });
    const result = err(e);
    expect(result).toEqual({ success: false, error: e });
  });

  it('fromPromise resolves to success result', async () => {
    const result = await fromPromise(Promise.resolve('hello'), 'kavenegar');
    expect(result).toEqual({ success: true, data: 'hello' });
  });

  it('fromPromise wraps IranSmsError rejection as same instance', async () => {
    const e = new IranSmsError({ message: 'fail', code: 'PROVIDER_ERROR', provider: 'smsir' });
    const result = await fromPromise(Promise.reject(e), 'smsir');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe(e);
  });

  it('fromPromise wraps plain Error rejection with NETWORK_ERROR', async () => {
    const result = await fromPromise(Promise.reject(new Error('oops')), 'ghasedak');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe('NETWORK_ERROR');
  });

  it('fromPromise never throws — always resolves', async () => {
    await expect(fromPromise(Promise.reject(new Error('x')), 'kavenegar')).resolves.toBeDefined();
  });
});
