---
"@alikhangholi/iran-sms": major
---

Initial release — v1.0.0

## Features

- Unified TypeScript SDK for Iranian SMS panels
- Supported providers: KavehNegar, SMS.ir, FarazSMS, Ghasedak
- Methods: `send` (single + bulk), `sendPattern` (OTP/template), `getStatus`, `getCredit`
- Throw mode (default) and safe mode (`safe: true`) — never throws, returns `SmsResult<T>`
- Phone number normalization for all Iranian mobile formats
- Zero runtime dependencies — uses Node.js built-in fetch (Node ≥ 18)
- Full TypeScript types with strict mode
- n8n compatible
