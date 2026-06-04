# @alikhangholi/iran-sms — Complete User Guide

> Unified TypeScript/JavaScript SDK for Iranian SMS panels.
> One consistent API across all supported providers — swap providers by changing one config line.

**Version:** 1.0.0
**Node.js required:** ≥ 18
**TypeScript:** fully typed — works in JS too
**Zero runtime dependencies**

---

## 1. What This Package Does

Every Iranian SMS panel has its own API, authentication style, endpoint format, and phone number format expectation. Integrating even two panels means writing and maintaining two completely different HTTP clients, two error handling systems, two sets of documentation to read, and two codebases to keep in sync when providers update their APIs. This is tedious, fragile, and completely unnecessary.

`@alikhangholi/iran-sms` solves this by providing one unified class — `IranSms` — with identical methods regardless of which panel is underneath. You configure the provider once at instantiation, then call `send()`, `sendPattern()`, `getStatus()`, and `getCredit()` the same way forever. Switching from KavehNegar to Ghasedak is a one-line config change. Your business logic never changes.

This package is for Node.js developers, n8n workflow builders, and backend engineers building notification systems, OTP/verification flows, transactional SMS, or marketing tools for Iranian audiences. If you are building a server-side application that needs to send SMS to Iranian mobile numbers — this is the library for you.

What this package is **not**: it is not a panel dashboard, not a reseller tool, not a frontend/browser SDK, and not a CLI tool. It is a server-side Node.js library only. It requires Node.js 18 or higher and runs exclusively in backend environments.

---

## 2. Supported Providers

| Provider | Version | Auth Type | Website |
|---|---|---|---|
| KavehNegar (کاوه‌نگار) | ✅ v1.0 | API Key | kavenegar.com |
| SMS.ir | ✅ v1.0 | API Key | sms.ir |
| FarazSMS (فراز اس‌ام‌اس) | ✅ v1.0 | Username + Password | farazsms.com |
| Ghasedak (قاصدک) | ✅ v1.0 | API Key | ghasedak.me |
| MeliPayamak (ملی پیامک) | 🔜 v1.x | Username + Password | melipayamak.com |
| IPPanel | 🔜 v1.x | Username + Password | ippanel.com |
| RayganSMS (رایگان اس‌ام‌اس) | 🔜 v1.x | Username + Password | raygansms.com |
| ParsGreen (پارس‌گرین) | 🔜 v1.x | API Key | parsgreen.com |
| PayamResan (پیام‌رسان) | 🔜 v1.x | API Key | payamresan.com |

> All providers normalize phone numbers automatically. You can pass any valid Iranian mobile format (`09xx`, `9xx`, `+98xx`, `0098xx`) and the SDK handles conversion internally — no manual formatting required.

---

## 3. Installation

```bash
npm install @alikhangholi/iran-sms
```

**Requirements:**
- Node.js 18 or higher (uses the built-in `fetch` API — no polyfill needed)
- Works in TypeScript and plain JavaScript projects
- ESM and CommonJS both supported

---

## 4. Getting Your API Credentials

### KavehNegar
1. Go to [kavenegar.com](https://kavenegar.com) → sign up or log in
2. Dashboard → **API Keys** section
3. Copy your API Key
4. Your line number is shown in the **Lines** section (format: `10004346` or similar)

### SMS.ir
1. Go to [sms.ir](https://sms.ir) → sign up or log in
2. User panel → **API Settings**
3. Copy your API Key (labeled `X-API-KEY`)
4. Your line number is a long number (format: `300000000000`)

### FarazSMS
1. Go to [farazsms.com](https://farazsms.com) → sign up or log in
2. Use your panel **username** and **password** directly — the same credentials you log in with
3. Your line number is shown in your panel lines list

### Ghasedak
1. Go to [ghasedak.me](https://ghasedak.me) → sign up or log in
2. Account settings → **API Key**
3. Your line number is shown in the lines/numbers section

---

## 5. Quick Start

### JavaScript — CommonJS (works in n8n, plain Node.js)

```js
const { IranSms } = require('@alikhangholi/iran-sms');

const sms = new IranSms({
  provider: {
    provider: 'kavenegar',
    apiKey: 'your-api-key-here',
    lineNumber: '10004346',
  },
});

async function main() {
  const result = await sms.send({
    to: '09121234567',
    message: 'سلام! این یک پیام آزمایشی است.',
  });
  console.log('Sent! Message ID:', result.messageId);
}

main();
```

### TypeScript — ESM

```ts
import { IranSms } from '@alikhangholi/iran-sms';

const sms = new IranSms({
  provider: {
    provider: 'kavenegar',
    apiKey: 'your-api-key-here',
    lineNumber: '10004346',
  },
});

const result = await sms.send({
  to: '09121234567',
  message: 'Hello from iran-sms!',
});

console.log(result.messageId); // e.g. 8792343
console.log(result.status);    // 'queued' | 'sent' | 'failed'
console.log(result.provider);  // 'kavenegar'
```

---

## 6. Provider Configuration Reference

### 6.1 KavehNegar

```ts
const sms = new IranSms({
  provider: {
    provider: 'kavenegar',  // must be exactly this string
    apiKey: 'YOUR_API_KEY', // from kavenegar.com dashboard
    lineNumber: '10004346', // your SMS line number (string)
  },
  timeout: 10000,  // optional — request timeout in ms (default: 10000)
  safe: false,     // optional — error mode (default: false = throws on error)
});
```

| Field | Type | Required | Description |
|---|---|---|---|
| `provider` | `'kavenegar'` | ✅ | Provider identifier |
| `apiKey` | `string` | ✅ | API key from kavenegar.com |
| `lineNumber` | `string` | ✅ | Your SMS line number |
| `timeout` | `number` | ❌ | Request timeout ms, default 10000 |
| `safe` | `boolean` | ❌ | Safe mode, default false |

---

### 6.2 SMS.ir

```ts
const sms = new IranSms({
  provider: {
    provider: 'smsir',
    apiKey: 'YOUR_API_KEY',
    lineNumber: 300000000000, // number type — not a string
  },
});
```

| Field | Type | Required | Description |
|---|---|---|---|
| `provider` | `'smsir'` | ✅ | Provider identifier |
| `apiKey` | `string` | ✅ | API key from sms.ir |
| `lineNumber` | `number` | ✅ | Your line number as a **number** (unique to SMS.ir) |
| `timeout` | `number` | ❌ | Request timeout ms, default 10000 |
| `safe` | `boolean` | ❌ | Safe mode, default false |

---

### 6.3 FarazSMS

```ts
const sms = new IranSms({
  provider: {
    provider: 'farazsms',
    username: 'your-panel-username',
    password: 'your-panel-password',
    lineNumber: '3000XXXXX',
  },
});
```

| Field | Type | Required | Description |
|---|---|---|---|
| `provider` | `'farazsms'` | ✅ | Provider identifier |
| `username` | `string` | ✅ | Your FarazSMS panel username |
| `password` | `string` | ✅ | Your FarazSMS panel password |
| `lineNumber` | `string` | ✅ | Your SMS line number |
| `timeout` | `number` | ❌ | Request timeout ms, default 10000 |
| `safe` | `boolean` | ❌ | Safe mode, default false |

---

### 6.4 Ghasedak

```ts
const sms = new IranSms({
  provider: {
    provider: 'ghasedak',
    apiKey: 'YOUR_API_KEY',
    lineNumber: '5000XXXXX',
  },
});
```

| Field | Type | Required | Description |
|---|---|---|---|
| `provider` | `'ghasedak'` | ✅ | Provider identifier |
| `apiKey` | `string` | ✅ | API key from ghasedak.me |
| `lineNumber` | `string` | ✅ | Your SMS line number |
| `timeout` | `number` | ❌ | Request timeout ms, default 10000 |
| `safe` | `boolean` | ❌ | Safe mode, default false |

---

## 7. All Methods — Full Reference

### 7.1 `send()` — Send SMS

**Signature:**
```ts
sms.send(params: SendParams): Promise<SendResult | SendResult[]>
```

**Parameters:**

| Field | Type | Required | Description |
|---|---|---|---|
| `to` | `string \| string[]` | ✅ | One phone number or array for bulk |
| `message` | `string` | ✅ | Message text (Persian or English) |
| `lineNumber` | `string` | ❌ | Override the default line for this send only |
| `sendAt` | `Date` | ❌ | Schedule for future delivery (provider-dependent) |

**Returns:** single `SendResult` when `to` is a string, `SendResult[]` when `to` is an array.

**`SendResult` shape:**
```ts
{
  messageId: string | number;  // use this for getStatus() later
  provider: string;            // which provider handled it
  status: 'queued' | 'sent' | 'failed';
  rawResponse: unknown;        // original provider API response
}
```

**Send a single SMS:**
```ts
const result = await sms.send({
  to: '09121234567',
  message: 'Your order has been confirmed.',
});
console.log(result.messageId);
console.log(result.status); // 'queued'
```

**Send bulk SMS — one message to many numbers:**
```ts
const results = await sms.send({
  to: ['09121234567', '09361234567', '09031234567'],
  message: 'Special offer just for you!',
});
results.forEach(r => console.log(r.messageId, r.status));
```

**Schedule for future delivery:**
```ts
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0);

await sms.send({
  to: '09121234567',
  message: 'Good morning! Your appointment is today.',
  sendAt: tomorrow,
});
```

**Phone number formats — all of these work identically:**
```ts
// All four are the same number — SDK normalizes automatically
await sms.send({ to: '09121234567',    message: 'test' }); // with leading zero
await sms.send({ to: '9121234567',     message: 'test' }); // without zero
await sms.send({ to: '+989121234567',  message: 'test' }); // international +98
await sms.send({ to: '00989121234567', message: 'test' }); // international 0098
```

---

### 7.2 `sendPattern()` — OTP / Template SMS

Used for sending verification codes, OTP, and pre-approved message templates. This method is essential for sending to numbers that have blocked promotional SMS — which is very common in Iran. Pattern/template SMS bypasses the block because the content is pre-approved by the provider.

**Signature:**
```ts
sms.sendPattern(params: PatternParams): Promise<SendResult>
```

**Parameters:**

| Field | Type | Required | Description |
|---|---|---|---|
| `to` | `string` | ✅ | Recipient phone number |
| `templateId` | `string` | ✅ | Template/pattern ID from your provider panel |
| `variables` | `Record<string, string>` | ✅ | Template variable key-value pairs |
| `lineNumber` | `string` | ❌ | Override default line |

**Before using:** create a message template in your provider's web panel first. The template might look like:
```
کد تایید شما: {code}
```
or:
```
Your verification code is {code}. Valid for {minutes} minutes.
```

**OTP with one variable:**
```ts
await sms.sendPattern({
  to: '09121234567',
  templateId: 'verify-code',   // the name/ID of the template you created in your panel
  variables: {
    code: '4821',
  },
});
```

**Template with multiple variables:**
```ts
await sms.sendPattern({
  to: '09121234567',
  templateId: 'order-confirm',
  variables: {
    name: 'علی',
    orderNumber: '10234',
    amount: '۲۵۰,۰۰۰',
  },
});
```

> **Provider note:** KavehNegar maps variables to `token`, `token2`, `token3` (first 3 values). SMS.ir maps them to named `parameters`. FarazSMS maps them to `input_data`. Ghasedak maps them to `param1`, `param2`, `param3`. The SDK handles all mapping internally — you always pass a plain `variables` object regardless of provider.

---

### 7.3 `getStatus()` — Check Delivery Status

**Signature:**
```ts
sms.getStatus(params: StatusParams): Promise<DeliveryResult>
```

**Parameters:**

| Field | Type | Required | Description |
|---|---|---|---|
| `messageId` | `string \| number` | ✅ | The `messageId` returned from a `SendResult` |

**`DeliveryResult` shape:**
```ts
{
  messageId: string | number;
  status: 'delivered' | 'failed' | 'pending' | 'unknown';
  rawResponse: unknown;
}
```

**Status meanings:**

| Status | Meaning |
|---|---|
| `delivered` | Recipient's handset confirmed receipt |
| `failed` | Delivery failed — invalid number, turned off, blocked, etc. |
| `pending` | In queue or in transit — check again later |
| `unknown` | Provider returned a status code the SDK does not recognize |

**Example:**
```ts
const sent = await sms.send({ to: '09121234567', message: 'Hello' });

// Check immediately — will usually be 'pending'
const status = await sms.getStatus({ messageId: sent.messageId });
console.log(status.status); // 'pending'

// Check again after a few seconds
await new Promise(resolve => setTimeout(resolve, 5000));
const updated = await sms.getStatus({ messageId: sent.messageId });
console.log(updated.status); // 'delivered'
```

---

### 7.4 `getCredit()` — Check Account Balance

**Signature:**
```ts
sms.getCredit(): Promise<CreditResult>
```

**`CreditResult` shape:**
```ts
{
  balance: number;
  unit: 'rial' | 'sms'; // rial for most providers, sms count for Ghasedak
  rawResponse: unknown;
}
```

**Example:**
```ts
const credit = await sms.getCredit();

if (credit.unit === 'rial') {
  console.log(`Balance: ${credit.balance.toLocaleString('fa-IR')} ریال`);
} else {
  console.log(`Credits remaining: ${credit.balance} SMS`);
}
```

---

### 7.5 `getProvider()` — Get Active Provider Name

```ts
const name = sms.getProvider();
console.log(name); // 'kavenegar' | 'smsir' | 'farazsms' | 'ghasedak'
```

Useful for logging, debugging, or building provider-agnostic code that needs to know which panel is active at runtime.

---

## 8. Error Handling

### 8.1 Throw Mode (default)

By default the SDK throws `IranSmsError` on any failure. Wrap calls in try/catch:

```ts
import { IranSms, IranSmsError } from '@alikhangholi/iran-sms';

try {
  const result = await sms.send({ to: '09121234567', message: 'Hello' });
  console.log(result.messageId);
} catch (error) {
  if (error instanceof IranSmsError) {
    console.error('Provider:',    error.provider);      // 'kavenegar'
    console.error('Code:',        error.code);          // machine-readable code
    console.error('Message:',     error.message);       // human-readable description
    console.error('HTTP Status:', error.statusCode);    // e.g. 401, 429
    console.error('Raw:',         error.rawResponse);   // original provider response
  }
}
```

**Error codes:**

| Code | Meaning |
|---|---|
| `PROVIDER_ERROR` | Provider API returned an error response |
| `NETWORK_ERROR` | Could not reach the provider (network or DNS failure) |
| `TIMEOUT` | Request exceeded the configured timeout |
| `INVALID_PARAMS` | Invalid input parameters |
| `NOT_IMPLEMENTED` | Selected provider not yet available in this version |
| `UNKNOWN_ERROR` | Unexpected error not matching the above categories |

---

### 8.2 Safe Mode — Never Throws

Pass `safe: true` to get a result object instead of exceptions. Every method returns `SmsResult<T>`:

```ts
const sms = new IranSms({
  provider: { provider: 'kavenegar', apiKey: '...', lineNumber: '...' },
  safe: true,
});

const result = await sms.send({ to: '09121234567', message: 'Hello' });

if (result.success) {
  // TypeScript knows result.data is SendResult here
  console.log(result.data.messageId);
  console.log(result.data.status);
} else {
  // TypeScript knows result.error is IranSmsError here
  console.error(result.error.code);
  console.error(result.error.message);
}
```

**`SmsResult<T>` type:**
```ts
type SmsResult<T> =
  | { success: true;  data: T }
  | { success: false; error: IranSmsError }
```

**When to use safe mode:**
- n8n Function nodes — avoids uncaught promise rejections crashing the workflow
- `Promise.all` chains — handle all outcomes in one place
- Production notification services — never let an SMS failure crash your app
- Any context where you prefer to handle errors as values rather than exceptions

**Safe mode with bulk sends:**
```ts
const result = await sms.send({
  to: ['09121234567', '09361234567'],
  message: 'Hello everyone',
});

if (result.success) {
  const results = result.data; // SendResult[]
  results.forEach(r => console.log(r.messageId));
}
```

---

## 9. Using with n8n

This package works inside n8n **Function nodes** and **Code nodes** directly using `require()`.

### Setup

Install on your n8n server:
```bash
npm install @alikhangholi/iran-sms
```

If your n8n version requires allowlisting external modules, add `@alikhangholi/iran-sms` to the allowed modules list in your n8n environment settings.

---

### Example: Send OTP in a Function Node

```js
const { IranSms } = require('@alikhangholi/iran-sms');

const sms = new IranSms({
  provider: {
    provider: 'kavenegar',
    apiKey: $env.KAVENEGAR_API_KEY,
    lineNumber: $env.KAVENEGAR_LINE,
  },
  safe: true,
});

const phone = $json.phone;
const code = String(Math.floor(100000 + Math.random() * 900000));

const result = await sms.sendPattern({
  to: phone,
  templateId: 'verify-code',
  variables: { code },
});

if (result.success) {
  return [{ json: { success: true, messageId: result.data.messageId, code } }];
} else {
  return [{ json: { success: false, error: result.error.code, message: result.error.message } }];
}
```

---

### Example: Bulk Notification in a Function Node

```js
const { IranSms } = require('@alikhangholi/iran-sms');

const sms = new IranSms({
  provider: {
    provider: 'smsir',
    apiKey: $env.SMSIR_API_KEY,
    lineNumber: Number($env.SMSIR_LINE),
  },
  safe: true,
});

// $json.recipients is an array of phone numbers passed from a previous node
const result = await sms.send({
  to: $json.recipients,
  message: $json.message,
});

if (result.success) {
  return [{ json: { sent: result.data.length, ids: result.data.map(r => r.messageId) } }];
} else {
  throw new Error(result.error.message);
}
```

---

### Environment Variables in n8n

Store all credentials as n8n environment variables — never hardcode them in Function nodes.

Go to **Settings → Environment Variables** in your n8n instance:

| Variable | Description |
|---|---|
| `KAVENEGAR_API_KEY` | KavehNegar API key |
| `KAVENEGAR_LINE` | KavehNegar line number |
| `SMSIR_API_KEY` | SMS.ir API key |
| `SMSIR_LINE` | SMS.ir line number (will be cast to number) |
| `FARAZSMS_USERNAME` | FarazSMS panel username |
| `FARAZSMS_PASSWORD` | FarazSMS panel password |
| `FARAZSMS_LINE` | FarazSMS line number |
| `GHASEDAK_API_KEY` | Ghasedak API key |
| `GHASEDAK_LINE` | Ghasedak line number |

---

## 10. Switching Providers

Switching providers requires changing only the `provider` config block — no method calls change:

```ts
// Using KavehNegar
const sms = new IranSms({
  provider: {
    provider: 'kavenegar',
    apiKey: process.env.KAVENEGAR_API_KEY!,
    lineNumber: process.env.KAVENEGAR_LINE!,
  },
});

// Switch to Ghasedak — only this block changes, nothing else
const sms = new IranSms({
  provider: {
    provider: 'ghasedak',
    apiKey: process.env.GHASEDAK_API_KEY!,
    lineNumber: process.env.GHASEDAK_LINE!,
  },
});

// These calls stay identical regardless of which provider is active
await sms.send({ to: '09121234567', message: 'Hello' });
await sms.sendPattern({ to: '09121234567', templateId: 'verify', variables: { code: '1234' } });
await sms.getCredit();
```

**Production pattern — load provider from environment variable:**

```ts
import { IranSms, IranSmsConfig } from '@alikhangholi/iran-sms';

function buildSmsConfig(): IranSmsConfig {
  const provider = process.env.SMS_PROVIDER;

  if (provider === 'kavenegar') {
    return {
      provider: {
        provider: 'kavenegar',
        apiKey: process.env.KAVENEGAR_API_KEY!,
        lineNumber: process.env.KAVENEGAR_LINE!,
      },
    };
  }

  if (provider === 'smsir') {
    return {
      provider: {
        provider: 'smsir',
        apiKey: process.env.SMSIR_API_KEY!,
        lineNumber: Number(process.env.SMSIR_LINE),
      },
    };
  }

  if (provider === 'farazsms') {
    return {
      provider: {
        provider: 'farazsms',
        username: process.env.FARAZSMS_USERNAME!,
        password: process.env.FARAZSMS_PASSWORD!,
        lineNumber: process.env.FARAZSMS_LINE!,
      },
    };
  }

  if (provider === 'ghasedak') {
    return {
      provider: {
        provider: 'ghasedak',
        apiKey: process.env.GHASEDAK_API_KEY!,
        lineNumber: process.env.GHASEDAK_LINE!,
      },
    };
  }

  throw new Error(`Unknown SMS_PROVIDER: "${provider}". Must be one of: kavenegar, smsir, farazsms, ghasedak`);
}

const sms = new IranSms(buildSmsConfig());
```

Now switching providers is a deploy-time config change — no code changes required.

---

## 11. TypeScript Tips

### Narrow single vs bulk send result

```ts
const result = await sms.send({ to: '09121234567', message: 'Hi' });

if (Array.isArray(result)) {
  // result is SendResult[]
  result.forEach(r => console.log(r.messageId));
} else {
  // result is SendResult
  console.log(result.messageId);
}
```

### Narrow safe mode result

```ts
const result = await sms.send({ to: '09121234567', message: 'Hi' }); // safe: true

if (result.success) {
  // TypeScript enforces: result.data is available, result.error is not
  console.log(result.data.messageId);
} else {
  // TypeScript enforces: result.error is available, result.data is not
  console.log(result.error.code);
}
```

### Import only types (no runtime cost)

```ts
import type {
  IranSmsConfig,
  ProviderConfig,
  SendParams,
  PatternParams,
  StatusParams,
  SendResult,
  DeliveryResult,
  CreditResult,
  SmsResult,
  SmsProviderName,
  KavenegarConfig,
  SmsIrConfig,
  FarazSmsConfig,
  GhasedakConfig,
} from '@alikhangholi/iran-sms';
```

### Type-safe provider config builder

```ts
import type { KavenegarConfig } from '@alikhangholi/iran-sms';

const config: KavenegarConfig = {
  provider: 'kavenegar',  // TypeScript will error if you mistype this
  apiKey: process.env.API_KEY!,
  lineNumber: process.env.LINE!,
};
```

---

## 12. Common Problems and Solutions

| Problem | Likely Cause | Solution |
|---|---|---|
| `PROVIDER_ERROR` with HTTP 401 | Wrong API key | Double-check the API key in your provider's web panel |
| `PROVIDER_ERROR` with HTTP 429 | Rate limit hit | Add delay between sends; check your provider's rate limit docs |
| `TIMEOUT` error | Provider API slow or unreachable | Increase `timeout` in config; verify outbound internet access from your server |
| `NETWORK_ERROR` | No internet or DNS failure | Check server connectivity; confirm provider API URL is reachable |
| `NOT_IMPLEMENTED` error | Used a v1.x provider | Switch to one of the 4 v1.0 providers; v1.x coming in next release |
| `status` is always `'unknown'` | Unrecognized provider status code | Check `rawResponse` for actual status; open a GitHub issue |
| Phone number throws `Invalid Iranian phone number` | Non-Iranian or malformed number | Only Iranian mobile numbers (09xx family) are supported |
| `result.data` is undefined in safe mode | Forgot to check `result.success` first | Always check `if (result.success)` before accessing `result.data` |
| n8n: `Cannot find module '@alikhangholi/iran-sms'` | Package not installed on the n8n server | Run `npm install @alikhangholi/iran-sms` on the server running n8n, not on your local machine |
| Build error: `fetch is not defined` | Node.js version below 18 | Upgrade to Node.js 18 or higher |
| Template SMS not delivered | Template not approved or wrong `templateId` | Log into your provider panel and confirm the template is approved and the ID matches exactly |

---

## 13. Security Best Practices

- **Never hardcode credentials** — always use environment variables or a secrets manager such as HashiCorp Vault, AWS Secrets Manager, or Doppler
- **Never commit `.env` files** — add `.env` to `.gitignore`; use `.env.example` with placeholder values for documentation
- **Rotate API keys periodically** — especially after any potential exposure (leaked in logs, committed by accident, etc.)
- **Use safe mode in production** — prevents unhandled promise rejections from crashing your process when the SMS provider has an outage
- **Validate phone numbers before sending** — the SDK normalizes format but does not verify whether a number is real or currently active; sending to invalid numbers wastes credits
- **Do not log `rawResponse` in production** — provider responses sometimes contain account metadata, credit details, or other sensitive information
- **Set a reasonable `timeout`** — the default is 10 seconds; for high-throughput systems consider lowering it to 5 seconds to fail fast and free resources

---

## 14. Changelog

### v1.0.0 — 2026-06-04

First public release.

**Providers:** KavehNegar · SMS.ir · FarazSMS · Ghasedak

**Methods:** `send` (single + bulk) · `sendPattern` · `getStatus` · `getCredit` · `getProvider`

**Features:**
- Throw mode (default) and safe mode (`safe: true`)
- Automatic phone number normalization for all Iranian mobile formats
- Zero runtime dependencies — uses Node.js 18 built-in `fetch`
- ESM and CommonJS both supported
- Full TypeScript types — strict mode, all types exported
- n8n compatible via `require()`
- npm provenance attestation on every publish

---

## 15. Links

| Resource | URL |
|---|---|
| npm package | https://www.npmjs.com/package/@alikhangholi/iran-sms |
| GitHub repository | https://github.com/alikhangholi/iran-sms |
| Report a bug | https://github.com/alikhangholi/iran-sms/issues |
| KavehNegar API docs | https://kavenegar.com/rest.html |
| SMS.ir API docs | https://sms.ir/rest-api |
| FarazSMS API docs | https://farazsms.com/api |
| Ghasedak API docs | https://ghasedak.me/docs |

---

*MIT © 2026 alikhangholi*
