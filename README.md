# @alikhangholi/iran-sms

> Unified TypeScript SDK for Iranian SMS panels.
> One API. Any provider.

[![npm version](https://img.shields.io/npm/v/@alikhangholi/iran-sms)](https://www.npmjs.com/package/@alikhangholi/iran-sms)
[![CI](https://github.com/alikhangholi/iran-sms/actions/workflows/ci.yml/badge.svg)](https://github.com/alikhangholi/iran-sms/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Supported Providers

| Provider | Status | Auth | Phone Format |
|---|---|---|---|
| KavehNegar | ✅ v1.0 | API Key | `9121234567` |
| SMS.ir | ✅ v1.0 | API Key | `9121234567` |
| FarazSMS | ✅ v1.0 | Username + Password | `+989121234567` |
| Ghasedak | ✅ v1.0 | API Key | `9121234567` |
| MeliPayamak | 🔜 v1.x | Username + Password | — |
| IPPanel | 🔜 v1.x | Username + Password | — |
| RayganSMS | 🔜 v1.x | Username + Password | — |
| ParsGreen | 🔜 v1.x | API Key | — |
| PayamResan | 🔜 v1.x | API Key | — |

## Install

```bash
npm install @alikhangholi/iran-sms
```

Requires Node.js ≥ 18.

## Quick Start

```ts
import { IranSms } from '@alikhangholi/iran-sms';

const sms = new IranSms({
  provider: {
    provider: 'kavenegar',
    apiKey: 'your-api-key',
    lineNumber: '10004346',
  },
});

// Send a single SMS
const result = await sms.send({
  to: '09121234567',
  message: 'Hello from iran-sms!',
});
console.log(result.messageId);

// Send bulk SMS
const results = await sms.send({
  to: ['09121234567', '09361234567'],
  message: 'Broadcast message',
});

// Send OTP / pattern SMS
await sms.sendPattern({
  to: '09121234567',
  templateId: 'your-template-name',
  variables: { code: '4821' },
});

// Check delivery status
const status = await sms.getStatus({ messageId: result.messageId });
console.log(status.status); // 'delivered' | 'pending' | 'failed' | 'unknown'

// Check account credit
const credit = await sms.getCredit();
console.log(credit.balance, credit.unit); // e.g. 50000 'rial'
```

## Safe Mode (never throws)

```ts
const sms = new IranSms({
  provider: {
    provider: 'smsir',
    apiKey: 'your-api-key',
    lineNumber: 300000000000,
  },
  safe: true, // all methods return SmsResult<T> instead of throwing
});

const result = await sms.send({ to: '09121234567', message: 'Hello' });

if (result.success) {
  console.log(result.data.messageId);
} else {
  console.error(result.error.code);    // 'PROVIDER_ERROR' | 'NETWORK_ERROR' | etc.
  console.error(result.error.message);
}
```

## Error Handling (throw mode)

```ts
import { IranSms, IranSmsError } from '@alikhangholi/iran-sms';

try {
  await sms.send({ to: '09121234567', message: 'Hello' });
} catch (e) {
  if (e instanceof IranSmsError) {
    console.error(e.code);        // 'INVALID_API_KEY' | 'RATE_LIMITED' | 'NETWORK_ERROR' | ...
    console.error(e.provider);    // 'kavenegar'
    console.error(e.statusCode);  // HTTP status if applicable
    console.error(e.rawResponse); // raw provider response
  }
}
```

## Provider Configuration

### KavehNegar

```ts
{
  provider: 'kavenegar',
  apiKey: string,       // from kavenegar.com account settings
  lineNumber: string,   // your SMS line number e.g. '10004346'
}
```

### SMS.ir

```ts
{
  provider: 'smsir',
  apiKey: string,       // from sms.ir account settings
  lineNumber: number,   // your line number as a number e.g. 300000000000
}
```

### FarazSMS

```ts
{
  provider: 'farazsms',
  username: string,
  password: string,
  lineNumber: string,   // e.g. '3000XXXXX'
}
```

### Ghasedak

```ts
{
  provider: 'ghasedak',
  apiKey: string,       // from ghasedak.me account
  lineNumber: string,   // e.g. '5000XXXXX'
}
```

## API Reference

| Method | Parameters | Returns | Description |
|---|---|---|---|
| `send(params)` | `SendParams` | `Promise<SendResult \| SendResult[]>` | Send single or bulk SMS |
| `sendPattern(params)` | `PatternParams` | `Promise<SendResult>` | Send OTP or template SMS |
| `getStatus(params)` | `StatusParams` | `Promise<DeliveryResult>` | Check delivery status of a sent message |
| `getCredit()` | — | `Promise<CreditResult>` | Get account balance |
| `getProvider()` | — | `SmsProviderName` | Returns the active provider name |

> In safe mode (`safe: true`), all methods return `Promise<SmsResult<T>>` instead.

### SendParams

```ts
interface SendParams {
  to: string | string[];   // single number or array for bulk
  message: string;
  lineNumber?: string;     // override the default line number
  sendAt?: Date;           // schedule for future delivery (provider-dependent)
}
```

### PatternParams

```ts
interface PatternParams {
  to: string;
  templateId: string;                    // template/pattern ID from your provider panel
  variables: Record<string, string>;     // template variables
  lineNumber?: string;
}
```

### SmsResult\<T\> (safe mode)

```ts
type SmsResult<T> =
  | { success: true;  data: T }
  | { success: false; error: IranSmsError }
```

## n8n Usage

This package works in n8n custom Function nodes. Import it as a regular Node.js module. A dedicated `@alikhangholi/n8n-nodes-iran-sms` community node is in development.

```js
const { IranSms } = require('@alikhangholi/iran-sms');
const sms = new IranSms({ provider: { provider: 'kavenegar', apiKey: $env.KAVEH_API_KEY, lineNumber: '10004346' } });
const result = await sms.send({ to: $json.phone, message: $json.message });
return [{ json: result }];
```

## License

MIT © alikhangholi
