# Changelog

## 1.0.0 — 2026-06-04

### Features

- **KavehNegar** provider — send, bulk send, pattern SMS, delivery status, credit check
- **SMS.ir** provider — send, bulk send, verify SMS, delivery status, credit check
- **FarazSMS** provider — send, bulk send, pattern SMS, delivery status, credit check
- **Ghasedak** provider — send, bulk send, OTP SMS, delivery status, credit check
- **Safe mode** — `safe: true` config option returns `SmsResult<T>` instead of throwing
- **Phone normalizer** — handles all Iranian mobile number formats (`09xx`, `9xx`, `+98xx`, `0098xx`, `98xx`)
- **Zero runtime dependencies** — uses Node.js 18 built-in `fetch`
- **Full TypeScript** — strict mode, all types exported
