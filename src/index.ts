export { IranSms } from './lib/client.js';

export { IranSmsError } from './lib/error.js';

export { ok, err, fromPromise } from './lib/result.js';

export type {
  SmsProviderName,
  ApiKeyAuth,
  UserPassAuth,
  KavenegarConfig,
  SmsIrConfig,
  FarazSmsConfig,
  GhasedakConfig,
  MeliPayamakConfig,
  IPPanelConfig,
  RayganSmsConfig,
  ParsGreenConfig,
  PayamResanConfig,
  ProviderConfig,
  IranSmsConfig,
  SendParams,
  PatternParams,
  StatusParams,
  SendResult,
  DeliveryStatus,
  DeliveryResult,
  CreditResult,
  SmsResult,
} from './lib/types.js';

export type { NormalizedPhone } from './lib/utils/normalize-phone.js';
