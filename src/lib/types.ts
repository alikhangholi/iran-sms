import type { IranSmsError } from './error.js';

export type SmsProviderName =
  | 'kavenegar'
  | 'smsir'
  | 'farazsms'
  | 'ghasedak'
  | 'melipayamak'
  | 'ippanel'
  | 'raygansms'
  | 'parsgreen'
  | 'payamresan';

export type ApiKeyAuth = { apiKey: string };
export type UserPassAuth = { username: string; password: string };

export type KavenegarConfig = { provider: 'kavenegar'; lineNumber: string } & ApiKeyAuth;
export type SmsIrConfig = { provider: 'smsir'; lineNumber: number } & ApiKeyAuth;
export type FarazSmsConfig = { provider: 'farazsms'; lineNumber: string } & UserPassAuth;
export type GhasedakConfig = { provider: 'ghasedak'; lineNumber: string } & ApiKeyAuth;
export type MeliPayamakConfig = { provider: 'melipayamak'; lineNumber: string } & UserPassAuth;
export type IPPanelConfig = { provider: 'ippanel'; lineNumber: string } & UserPassAuth;
export type RayganSmsConfig = { provider: 'raygansms'; lineNumber: string } & UserPassAuth;
export type ParsGreenConfig = { provider: 'parsgreen'; lineNumber: string } & ApiKeyAuth;
export type PayamResanConfig = { provider: 'payamresan'; lineNumber: string } & ApiKeyAuth;

export type ProviderConfig =
  | KavenegarConfig
  | SmsIrConfig
  | FarazSmsConfig
  | GhasedakConfig
  | MeliPayamakConfig
  | IPPanelConfig
  | RayganSmsConfig
  | ParsGreenConfig
  | PayamResanConfig;

export type IranSmsConfig = {
  provider: ProviderConfig;
  safe?: boolean;
  timeout?: number;
};

export type SendParams = {
  to: string | string[];
  message: string;
  lineNumber?: string;
  sendAt?: Date;
};

export type PatternParams = {
  to: string;
  templateId: string;
  variables: Record<string, string>;
  lineNumber?: string;
};

export type StatusParams = {
  messageId: string | number;
};

export type SendResult = {
  messageId: string | number;
  provider: SmsProviderName;
  status: 'queued' | 'sent' | 'failed';
  rawResponse: unknown;
};

export type DeliveryStatus = 'delivered' | 'failed' | 'pending' | 'unknown';

export type DeliveryResult = {
  messageId: string | number;
  status: DeliveryStatus;
  rawResponse: unknown;
};

export type CreditResult = {
  balance: number;
  unit: 'rial' | 'sms';
  rawResponse: unknown;
};

export type SmsResult<T> = { success: true; data: T } | { success: false; error: IranSmsError };
