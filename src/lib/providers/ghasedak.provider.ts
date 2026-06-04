import { SmsProvider } from './base.provider.js';
import { HttpClient } from '../utils/http.js';
import { IranSmsError } from '../error.js';
import { normalizePhone, normalizePhonesArray } from '../utils/normalize-phone.js';
import type {
  GhasedakConfig,
  SendParams,
  PatternParams,
  StatusParams,
  SendResult,
  DeliveryResult,
  CreditResult,
} from '../types.js';

type GhasedakResult = { code: number; description: string };
type GhasedakEnvelope<T> = { result: GhasedakResult; items?: T };
type GhasedakSentItem = { id: string | number; status: number };
type GhasedakDeliveryItem = { deliveryState: number };
type GhasedakCreditItem = { credit: number };

const BASE = 'https://gateway.ghasedak.me/rest/api/v1/WebService/';

function assertSuccess(res: GhasedakEnvelope<unknown>): void {
  if (res.result.code !== 200) {
    throw new IranSmsError({
      message: res.result.description,
      code: 'PROVIDER_ERROR',
      provider: 'ghasedak',
      rawResponse: res,
    });
  }
}

function mapSentStatus(s: number): SendResult['status'] {
  return s === 1 || s === 2 ? 'queued' : 'sent';
}

function mapDeliveryState(s: number): DeliveryResult['status'] {
  if (s === 1) return 'delivered';
  if (s === 2) return 'failed';
  if (s === 0) return 'pending';
  return 'unknown';
}

export class GhasedakProvider extends SmsProvider {
  private readonly authHeaders: Record<string, string>;

  constructor(config: GhasedakConfig, timeout: number) {
    super(new HttpClient(timeout), 'ghasedak', config.lineNumber);
    this.authHeaders = { ApiKey: config.apiKey };
  }

  async send(params: SendParams): Promise<SendResult | SendResult[]> {
    try {
      const lineNumber = this.resolveLineNumber(params.lineNumber);
      const sendDate = params.sendAt !== undefined ? params.sendAt.toISOString() : undefined;
      const isSingle = typeof params.to === 'string';

      if (isSingle) {
        const receptor = normalizePhone(params.to as string).withoutZero;
        const body: Record<string, unknown> = { lineNumber, receptor, message: params.message };
        if (sendDate !== undefined) body['sendDate'] = sendDate;

        const res = await this.http.request<GhasedakEnvelope<GhasedakSentItem[]>>({
          method: 'POST',
          url: BASE + 'SendSingleSMS',
          headers: this.authHeaders,
          provider: 'ghasedak',
          body,
        });
        assertSuccess(res.data);
        const item = res.data.items?.[0];
        if (item === undefined)
          throw new IranSmsError({
            message: 'Empty items',
            code: 'PROVIDER_ERROR',
            provider: 'ghasedak',
            rawResponse: res.data,
          });
        return this.toSendResult({
          messageId: item.id,
          status: mapSentStatus(item.status),
          rawResponse: res.data,
        });
      }

      const receptors = normalizePhonesArray(params.to as string[]).map((p) => p.withoutZero);
      const body: Record<string, unknown> = { lineNumber, receptors, message: params.message };
      if (sendDate !== undefined) body['sendDate'] = sendDate;

      const res = await this.http.request<GhasedakEnvelope<GhasedakSentItem[]>>({
        method: 'POST',
        url: BASE + 'SendBulkSMS',
        headers: this.authHeaders,
        provider: 'ghasedak',
        body,
      });
      assertSuccess(res.data);
      return (res.data.items ?? []).map((item) =>
        this.toSendResult({
          messageId: item.id,
          status: mapSentStatus(item.status),
          rawResponse: res.data,
        }),
      );
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'ghasedak');
    }
  }

  async sendPattern(params: PatternParams): Promise<SendResult> {
    try {
      const receptor = normalizePhone(params.to).withoutZero;
      const vals = Object.values(params.variables);
      const body: Record<string, unknown> = { receptor, type: 1, template: params.templateId };
      if (vals[0] !== undefined) body['param1'] = vals[0];
      if (vals[1] !== undefined) body['param2'] = vals[1];
      if (vals[2] !== undefined) body['param3'] = vals[2];

      const res = await this.http.request<GhasedakEnvelope<GhasedakSentItem[]>>({
        method: 'POST',
        url: BASE + 'SendOTPSMS',
        headers: this.authHeaders,
        provider: 'ghasedak',
        body,
      });
      assertSuccess(res.data);
      const item = res.data.items?.[0];
      if (item === undefined)
        throw new IranSmsError({
          message: 'Empty items',
          code: 'PROVIDER_ERROR',
          provider: 'ghasedak',
          rawResponse: res.data,
        });
      return this.toSendResult({
        messageId: item.id,
        status: mapSentStatus(item.status),
        rawResponse: res.data,
      });
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'ghasedak');
    }
  }

  async getStatus(params: StatusParams): Promise<DeliveryResult> {
    try {
      const res = await this.http.request<GhasedakEnvelope<GhasedakDeliveryItem[]>>({
        method: 'POST',
        url: BASE + 'GetDeliveries2',
        headers: this.authHeaders,
        provider: 'ghasedak',
        body: { Id: [String(params.messageId)] },
      });
      assertSuccess(res.data);
      const item = res.data.items?.[0];
      return {
        messageId: params.messageId,
        status: item !== undefined ? mapDeliveryState(item.deliveryState) : 'unknown',
        rawResponse: res.data,
      };
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'ghasedak');
    }
  }

  async getCredit(): Promise<CreditResult> {
    try {
      const res = await this.http.request<GhasedakEnvelope<GhasedakCreditItem[]>>({
        method: 'GET',
        url: BASE + 'GetCredit',
        headers: this.authHeaders,
        provider: 'ghasedak',
      });
      assertSuccess(res.data);
      const item = res.data.items?.[0];
      return { balance: item?.credit ?? 0, unit: 'sms', rawResponse: res.data };
    } catch (error: unknown) {
      if (error instanceof IranSmsError) throw error;
      throw IranSmsError.from(error, 'ghasedak');
    }
  }
}
