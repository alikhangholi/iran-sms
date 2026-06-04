import { SmsProvider } from './base.provider.js';
import { HttpClient } from '../utils/http.js';
import { IranSmsError } from '../error.js';
import { normalizePhone, normalizePhonesArray } from '../utils/normalize-phone.js';
import type {
  FarazSmsConfig,
  SendParams,
  PatternParams,
  StatusParams,
  SendResult,
  DeliveryResult,
  CreditResult,
} from '../types.js';

type FarazResponse<T> = { status: 'success' | 'error'; error_code?: string; data?: T };
type FarazStatusItem = { status: string };
type FarazCreditData = { credit: number };

const BASE = 'https://ippanel.com/api/select';

function assertSuccess(res: FarazResponse<unknown>): void {
  if (res.status !== 'success') {
    throw new IranSmsError({
      message: res.error_code ?? 'Unknown FarazSMS error',
      code: 'PROVIDER_ERROR',
      provider: 'farazsms',
      rawResponse: res,
    });
  }
}

function mapStatus(s: string): DeliveryResult['status'] {
  if (s === 'delivered') return 'delivered';
  if (s === 'failed' || s === 'undelivered') return 'failed';
  if (s === 'pending' || s === 'queued') return 'pending';
  return 'unknown';
}

export class FarazSmsProvider extends SmsProvider {
  private readonly username: string;
  private readonly password: string;

  constructor(config: FarazSmsConfig, timeout: number) {
    super(new HttpClient(timeout), 'farazsms', config.lineNumber);
    this.username = config.username;
    this.password = config.password;
  }

  private authBody(): { op_id: string; op_pass: string } {
    return { op_id: this.username, op_pass: this.password };
  }

  async send(params: SendParams): Promise<SendResult | SendResult[]> {
    try {
      const lineNumber = this.resolveLineNumber(params.lineNumber);
      const isSingle = typeof params.to === 'string';
      const toArr: string[] = typeof params.to === 'string' ? [params.to] : params.to;
      const normalized = normalizePhonesArray(toArr).map((p) => p.withCountryCode);

      const res = await this.http.request<FarazResponse<string[]>>({
        method: 'POST',
        url: BASE,
        provider: 'farazsms',
        body: {
          ...this.authBody(),
          method: 'sms',
          from: lineNumber,
          to: normalized,
          message: params.message,
        },
      });
      assertSuccess(res.data);

      const ids = res.data.data ?? [];
      const results = ids.map((id) =>
        this.toSendResult({ messageId: id, status: 'queued', rawResponse: res.data }),
      );

      if (isSingle) {
        return (
          results[0] ??
          this.toSendResult({ messageId: '', status: 'queued', rawResponse: res.data })
        );
      }
      return results;
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'farazsms');
    }
  }

  async sendPattern(params: PatternParams): Promise<SendResult> {
    try {
      const lineNumber = this.resolveLineNumber(params.lineNumber);
      const to = normalizePhone(params.to).withCountryCode;
      const input_data = Object.entries(params.variables).map(([k, v]) => ({ [k]: v }));

      const res = await this.http.request<FarazResponse<string[]>>({
        method: 'POST',
        url: BASE,
        provider: 'farazsms',
        body: {
          ...this.authBody(),
          method: 'pattern',
          from: lineNumber,
          to,
          pattern_code: params.templateId,
          input_data,
        },
      });
      assertSuccess(res.data);

      const id = res.data.data?.[0] ?? '';
      return this.toSendResult({ messageId: id, status: 'queued', rawResponse: res.data });
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'farazsms');
    }
  }

  async getStatus(params: StatusParams): Promise<DeliveryResult> {
    try {
      const res = await this.http.request<FarazResponse<FarazStatusItem[]>>({
        method: 'POST',
        url: BASE,
        provider: 'farazsms',
        body: { ...this.authBody(), method: 'status', message_ids: [String(params.messageId)] },
      });
      assertSuccess(res.data);

      const item = res.data.data?.[0];
      return {
        messageId: params.messageId,
        status: item !== undefined ? mapStatus(item.status) : 'unknown',
        rawResponse: res.data,
      };
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'farazsms');
    }
  }

  async getCredit(): Promise<CreditResult> {
    try {
      const res = await this.http.request<FarazResponse<FarazCreditData>>({
        method: 'POST',
        url: BASE,
        provider: 'farazsms',
        body: { ...this.authBody(), method: 'credit' },
      });
      assertSuccess(res.data);

      return { balance: res.data.data?.credit ?? 0, unit: 'rial', rawResponse: res.data };
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'farazsms');
    }
  }
}
