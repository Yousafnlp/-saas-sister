// Phone numbers arrive in many shapes for the same person: 0300-1234567, 0300 1234567,
// +92 300 1234567, 923001234567. The last 10 digits identify a Pakistani mobile number in all of them.

export const MIN_PHONE_DIGITS = 7;
export const MAX_PHONE_DIGITS = 15;

export function phoneDigits(number) {
  return String(number ?? '').replace(/\D/g, '');
}

export function phoneKey(number) {
  return phoneDigits(number).slice(-10);
}

export function isValidPhone(number) {
  const digits = phoneDigits(number).length;
  return /^[0-9+\-\s()]+$/.test(String(number)) && digits >= MIN_PHONE_DIGITS && digits <= MAX_PHONE_DIGITS;
}
