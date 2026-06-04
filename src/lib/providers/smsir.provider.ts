import { SmsProvider } from './base.provider.js';
import { HttpClient } from '../utils/http.js';
import { IranSmsError } from '../error.js';
import { normalizePhone } from '../utils/normalize-phone.js';
import type {
  SmsIrConfig,
  SendParams,
  PatternParams,
  StatusParams,
  SendResult,
  DeliveryResult,
  CreditResult,
} from '../types.js';

type SmsIrEnvelope<T> = { status: number; message: string; data: T };
type SmsIrSentItem = { messageId: string | number };
type SmsIrStatusData = { messageId: string | number; deliveryState: number };

function assertApiSuccess(res: SmsIrEnvelope<unknown>): void {
  if (res.status !== 1) {
    throw new IranSmsError({
      message: res.message,
      code: 'PROVIDER_ERROR',
      provider: 'smsir',
      rawResponse: res,
    });
  }
}

function mapDeliveryState(state: number): DeliveryResult['status'] {
  if (state === 1) return 'delivered';
  if (state === 2 || state === 3) return 'failed';
  if (state === 0) return 'pending';
  return 'unknown';
}

const BASE = 'https://api.sms.ir/v1/';

export class SmsIrProvider extends SmsProvider {
  private readonly authHeaders: Record<string, string>;

  constructor(config: SmsIrConfig, timeout: number) {
    super(new HttpClient(timeout), 'smsir', String(config.lineNumber));
    this.authHeaders = { 'X-API-KEY': config.apiKey };
  }

  async send(params: SendParams): Promise<SendResult | SendResult[]> {
    try {
      const toArr = typeof params.to === 'string' ? [params.to] : params.to;
      const mobiles = toArr.map(n => normalizePhone(n).withoutZero);
      const sendDateTime = params.sendAt !== undefined ? params.sendAt.toISOString() : null;

      const res = await this.http.request<SmsIrEnvelope<SmsIrSentItem[]>>({
        method: 'POST',
        url: BASE + 'send/bulk',
        headers: this.authHeaders,
        provider: 'smsir',
        body: {
          lineNumber: Number(this.defaultLineNumber),
          messageText: params.message,
          mobiles,
          sendDateTime,
        },
      });
      assertApiSuccess(res.data);

      const results = res.data.data.map(item =>
        this.toSendResult({ messageId: item.messageId, status: 'queued', rawResponse: res.data }),
      );

      return typeof params.to === 'string' ? (results[0] ?? this.toSendResult({ messageId: '', status: 'queued', rawResponse: res.data })) : results;
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'smsir');
    }
  }

  async sendPattern(params: PatternParams): Promise<SendResult> {
    try {
      const mobile = normalizePhone(params.to).withoutZero;
      const parameters = Object.entries(params.variables).map(([name, value]) => ({ name, value }));

      const res = await this.http.request<SmsIrEnvelope<SmsIrSentItem>>({
        method: 'POST',
        url: BASE + 'send/verify',
        headers: this.authHeaders,
        provider: 'smsir',
        body: { mobile, templateId: Number(params.templateId), parameters },
      });
      assertApiSuccess(res.data);

      return this.toSendResult({ messageId: res.data.data.messageId, status: 'queued', rawResponse: res.data });
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'smsir');
    }
  }

  async getStatus(params: StatusParams): Promise<DeliveryResult> {
    try {
      const res = await this.http.request<SmsIrEnvelope<SmsIrStatusData>>({
        method: 'GET',
        url: BASE + 'send/' + String(params.messageId),
        headers: this.authHeaders,
        provider: 'smsir',
      });
      assertApiSuccess(res.data);

      return {
        messageId: res.data.data.messageId,
        status: mapDeliveryState(res.data.data.deliveryState),
        rawResponse: res.data,
      };
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'smsir');
    }
  }

  async getCredit(): Promise<CreditResult> {
    try {
      const res = await this.http.request<SmsIrEnvelope<number>>({
        method: 'GET',
        url: BASE + 'credit',
        headers: this.authHeaders,
        provider: 'smsir',
      });
      assertApiSuccess(res.data);

      return { balance: res.data.data, unit: 'rial', rawResponse: res.data };
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'smsir');
    }
  }
}
