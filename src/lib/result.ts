import type { SmsResult, SmsProviderName } from './types.js';
import { IranSmsError } from './error.js';

export function ok<T>(data: T): SmsResult<T> {
  return { success: true, data };
}

export function err<T>(error: IranSmsError): SmsResult<T> {
  return { success: false, error };
}

export async function fromPromise<T>(
  promise: Promise<T>,
  provider: SmsProviderName,
): Promise<SmsResult<T>> {
  try {
    const value = await promise;
    return ok(value);
  } catch (thrown: unknown) {
    return err(IranSmsError.from(thrown, provider));
  }
}
