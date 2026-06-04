import type { SmsProviderName } from './types.js';

export class IranSmsError extends Error {
  public readonly code: string;
  public readonly provider: SmsProviderName;
  public readonly statusCode?: number;
  public readonly rawResponse?: unknown;

  constructor(params: {
    message: string;
    code: string;
    provider: SmsProviderName;
    statusCode?: number;
    rawResponse?: unknown;
  }) {
    super(params.message);
    this.name = 'IranSmsError';
    this.code = params.code;
    this.provider = params.provider;
    if (params.statusCode !== undefined) this.statusCode = params.statusCode;
    if (params.rawResponse !== undefined) this.rawResponse = params.rawResponse;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static from(error: unknown, provider: SmsProviderName): IranSmsError {
    if (error instanceof IranSmsError) return error;
    if (error instanceof Error) {
      return new IranSmsError({ message: error.message, code: 'NETWORK_ERROR', provider });
    }
    return new IranSmsError({
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
      provider,
    });
  }
}
