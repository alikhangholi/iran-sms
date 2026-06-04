export type NormalizedPhone = {
  withZero: string;
  withoutZero: string;
  withCountryCode: string;
};

export function normalizePhone(input: string): NormalizedPhone {
  let s = input.replace(/[\s\-()]/g, '');

  if (s.startsWith('+')) s = s.slice(1);
  if (s.startsWith('00')) s = s.slice(2);
  if (s.startsWith('98') && s.length === 12) s = s.slice(2);
  if (s.startsWith('0') && s.length === 11) s = s.slice(1);

  if (!/^9[0-9]{9}$/.test(s)) {
    throw new Error(`Invalid Iranian phone number: ${input}`);
  }

  return {
    withZero: '0' + s,
    withoutZero: s,
    withCountryCode: '+98' + s,
  };
}

export function normalizePhonesArray(inputs: string[]): NormalizedPhone[] {
  return inputs.map(normalizePhone);
}
