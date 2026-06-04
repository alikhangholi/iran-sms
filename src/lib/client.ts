import type {
  IranSmsConfig,
  ProviderConfig,
  SmsProviderName,
  SendParams,
  PatternParams,
  StatusParams,
  SendResult,
  DeliveryResult,
  CreditResult,
  SmsResult,
} from './types.js';
import { IranSmsError } from './error.js';
import { fromPromise } from './result.js';
import type { SmsProvider } from './providers/base.provider.js';
import { KavenegarProvider } from './providers/kavenegar.provider.js';
import { SmsIrProvider } from './providers/smsir.provider.js';
import { FarazSmsProvider } from './providers/farazsms.provider.js';
import { GhasedakProvider } from './providers/ghasedak.provider.js';

/** IranSms client */
export class IranSms {
  private readonly adapter: SmsProvider;
  private readonly safe: boolean;

  constructor(config: IranSmsConfig) {
    const timeout = config.timeout ?? 10000;
    this.safe = config.safe ?? false;
    this.adapter = IranSms.createAdapter(config.provider, timeout);
  }

  private static createAdapter(providerConfig: ProviderConfig, timeout: number): SmsProvider {
    switch (providerConfig.provider) {
      case 'kavenegar':
        return new KavenegarProvider(providerConfig, timeout);
      case 'smsir':
        return new SmsIrProvider(providerConfig, timeout);
      case 'farazsms':
        return new FarazSmsProvider(providerConfig, timeout);
      case 'ghasedak':
        return new GhasedakProvider(providerConfig, timeout);
      default: {
        const p = providerConfig as ProviderConfig;
        throw new IranSmsError({
          message: `Provider '${p.provider}' is not yet implemented. It will be added in v1.x.`,
          code: 'NOT_IMPLEMENTED',
          provider: p.provider,
        });
      }
    }
  }

  getProvider(): SmsProviderName {
    return this.adapter.providerName;
  }

  async send(
    params: SendParams,
  ): Promise<SendResult | SendResult[] | SmsResult<SendResult | SendResult[]>> {
    if (!this.safe) return this.adapter.send(params);
    return fromPromise(this.adapter.send(params), this.getProvider());
  }

  async sendPattern(params: PatternParams): Promise<SendResult | SmsResult<SendResult>> {
    if (!this.safe) return this.adapter.sendPattern(params);
    return fromPromise(this.adapter.sendPattern(params), this.getProvider());
  }

  async getStatus(params: StatusParams): Promise<DeliveryResult | SmsResult<DeliveryResult>> {
    if (!this.safe) return this.adapter.getStatus(params);
    return fromPromise(this.adapter.getStatus(params), this.getProvider());
  }

  async getCredit(): Promise<CreditResult | SmsResult<CreditResult>> {
    if (!this.safe) return this.adapter.getCredit();
    return fromPromise(this.adapter.getCredit(), this.getProvider());
  }
}
