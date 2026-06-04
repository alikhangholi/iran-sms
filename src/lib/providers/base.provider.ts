import type { HttpClient } from '../utils/http.js';
import type {
  SmsProviderName,
  SendParams,
  PatternParams,
  StatusParams,
  SendResult,
  DeliveryResult,
  CreditResult,
} from '../types.js';

export abstract class SmsProvider {
  protected constructor(
    protected readonly http: HttpClient,
    protected readonly providerName: SmsProviderName,
    protected readonly defaultLineNumber: string,
  ) {}

  abstract send(params: SendParams): Promise<SendResult | SendResult[]>;
  abstract sendPattern(params: PatternParams): Promise<SendResult>;
  abstract getStatus(params: StatusParams): Promise<DeliveryResult>;
  abstract getCredit(): Promise<CreditResult>;

  protected resolveLineNumber(override?: string): string {
    return override !== undefined && override.length > 0
      ? override
      : this.defaultLineNumber;
  }

  protected toSendResult(params: {
    messageId: string | number;
    status: SendResult['status'];
    rawResponse: unknown;
  }): SendResult {
    return {
      messageId: params.messageId,
      provider: this.providerName,
      status: params.status,
      rawResponse: params.rawResponse,
    };
  }
}
