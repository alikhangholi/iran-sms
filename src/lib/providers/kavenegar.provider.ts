import { SmsProvider } from './base.provider.js';
import { HttpClient } from '../utils/http.js';
import { IranSmsError } from '../error.js';
import { normalizePhone } from '../utils/normalize-phone.js';
import type {
  KavenegarConfig,
  SendParams,
  PatternParams,
  StatusParams,
  SendResult,
  DeliveryResult,
  CreditResult,
} from '../types.js';

type KavenegarReturn = { status: number; message: string };
type KavenegarEntry = { messageid: string | number; status: number };
type KavenegarResponse<T> = { return: KavenegarReturn; entries: T };
type AccountInfo = { remaincredit: number };

function assertApiSuccess(ret: KavenegarReturn, raw: unknown): void {
  if (ret.status !== 200) {
    throw new IranSmsError({
      message: ret.message,
      code: 'PROVIDER_ERROR',
      provider: 'kavenegar',
      rawResponse: raw,
    });
  }
}

function mapEntryStatus(s: number): SendResult['status'] {
  if (s === 1 || s === 2) return 'queued';
  return 'sent';
}

function mapDeliveryStatus(s: number): DeliveryResult['status'] {
  if (s === 10) return 'delivered';
  if (s === 20 || s === 21) return 'failed';
  if (s === 1 || s === 2 || s === 4 || s === 5) return 'pending';
  return 'unknown';
}

export class KavenegarProvider extends SmsProvider {
  private readonly baseUrl: string;

  constructor(config: KavenegarConfig, timeout: number) {
    const http = new HttpClient(timeout);
    super(http, 'kavenegar', config.lineNumber);
    this.baseUrl = 'https://api.kavenegar.com/v1/' + config.apiKey + '/';
  }

  async send(params: SendParams): Promise<SendResult | SendResult[]> {
    try {
      const lineNumber = this.resolveLineNumber(params.lineNumber);
      const dateField =
        params.sendAt !== undefined
          ? { date: Math.floor(params.sendAt.getTime() / 1000) }
          : {};

      if (typeof params.to === 'string') {
        const receptor = normalizePhone(params.to).withoutZero;
        const res = await this.http.request<KavenegarResponse<KavenegarEntry[]>>({
          method: 'POST',
          url: this.baseUrl + 'sms/send.json',
          provider: 'kavenegar',
          body: { sender: lineNumber, receptor, message: params.message, ...dateField },
        });
        assertApiSuccess(res.data.return, res.data);
        const entry = res.data.entries[0];
        if (entry === undefined) throw new IranSmsError({ message: 'Empty entries', code: 'PROVIDER_ERROR', provider: 'kavenegar', rawResponse: res.data });
        return this.toSendResult({ messageId: entry.messageid, status: mapEntryStatus(entry.status), rawResponse: res.data });
      }

      const receptors = params.to.map(n => normalizePhone(n).withoutZero);
      const res = await this.http.request<KavenegarResponse<KavenegarEntry[]>>({
        method: 'POST',
        url: this.baseUrl + 'sms/sendarray.json',
        provider: 'kavenegar',
        body: {
          sender: JSON.stringify(receptors.map(() => lineNumber)),
          receptor: JSON.stringify(receptors),
          message: JSON.stringify(receptors.map(() => params.message)),
          ...dateField,
        },
      });
      assertApiSuccess(res.data.return, res.data);
      return res.data.entries.map(e =>
        this.toSendResult({ messageId: e.messageid, status: mapEntryStatus(e.status), rawResponse: res.data }),
      );
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'kavenegar');
    }
  }

  async sendPattern(params: PatternParams): Promise<SendResult> {
    try {
      const receptor = normalizePhone(params.to).withoutZero;
      const vals = Object.values(params.variables);
      const body: Record<string, string> = {
        receptor,
        template: params.templateId,
      };
      if (vals[0] !== undefined) body['token'] = vals[0];
      if (vals[1] !== undefined) body['token2'] = vals[1];
      if (vals[2] !== undefined) body['token3'] = vals[2];

      const res = await this.http.request<KavenegarResponse<KavenegarEntry[]>>({
        method: 'POST',
        url: this.baseUrl + 'verify/lookup.json',
        provider: 'kavenegar',
        body,
      });
      assertApiSuccess(res.data.return, res.data);
      const entry = res.data.entries[0];
      if (entry === undefined) throw new IranSmsError({ message: 'Empty entries', code: 'PROVIDER_ERROR', provider: 'kavenegar', rawResponse: res.data });
      return this.toSendResult({ messageId: entry.messageid, status: mapEntryStatus(entry.status), rawResponse: res.data });
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'kavenegar');
    }
  }

  async getStatus(params: StatusParams): Promise<DeliveryResult> {
    try {
      const res = await this.http.request<KavenegarResponse<KavenegarEntry[]>>({
        method: 'POST',
        url: this.baseUrl + 'sms/status.json',
        provider: 'kavenegar',
        body: { messageid: params.messageId },
      });
      assertApiSuccess(res.data.return, res.data);
      const entry = res.data.entries[0];
      if (entry === undefined) throw new IranSmsError({ message: 'Empty entries', code: 'PROVIDER_ERROR', provider: 'kavenegar', rawResponse: res.data });
      return {
        messageId: entry.messageid,
        status: mapDeliveryStatus(entry.status),
        rawResponse: res.data,
      };
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'kavenegar');
    }
  }

  async getCredit(): Promise<CreditResult> {
    try {
      const res = await this.http.request<KavenegarResponse<AccountInfo>>({
        method: 'POST',
        url: this.baseUrl + 'account/info.json',
        provider: 'kavenegar',
      });
      assertApiSuccess(res.data.return, res.data);
      return {
        balance: res.data.entries.remaincredit,
        unit: 'rial',
        rawResponse: res.data,
      };
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'kavenegar');
    }
  }
}
