import { normalizePhone, normalizePhonesArray } from '../src/lib/utils/normalize-phone.js';

describe('normalizePhone', () => {
  const cases: [string, string, string, string][] = [
    ['09121234567',    '09121234567', '9121234567', '+989121234567'],
    ['9121234567',     '09121234567', '9121234567', '+989121234567'],
    ['+989121234567',  '09121234567', '9121234567', '+989121234567'],
    ['00989121234567', '09121234567', '9121234567', '+989121234567'],
    ['989121234567',   '09121234567', '9121234567', '+989121234567'],
    ['0912 123 4567',  '09121234567', '9121234567', '+989121234567'],
    ['0912-123-4567',  '09121234567', '9121234567', '+989121234567'],
  ];

  it.each(cases)('normalizes %s', (input, withZero, withoutZero, withCountryCode) => {
    const result = normalizePhone(input);
    expect(result.withZero).toBe(withZero);
    expect(result.withoutZero).toBe(withoutZero);
    expect(result.withCountryCode).toBe(withCountryCode);
  });
});

describe('normalizePhone — invalid inputs', () => {
  it.each(['12345', 'not-a-number', ''])('throws for %j', (input) => {
    expect(() => normalizePhone(input)).toThrow(/Invalid Iranian phone number/);
  });
});

describe('normalizePhonesArray', () => {
  it('returns array of NormalizedPhone for valid inputs', () => {
    const result = normalizePhonesArray(['09121234567', '09351234567']);
    expect(result).toHaveLength(2);
    expect(result[0]?.withZero).toBe('09121234567');
    expect(result[1]?.withZero).toBe('09351234567');
  });

  it('propagates error when array contains invalid number', () => {
    expect(() => normalizePhonesArray(['09121234567', '12345'])).toThrow(/Invalid Iranian phone number/);
  });
});
