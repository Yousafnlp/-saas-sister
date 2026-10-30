export function toDateOnly(value?: string | null): string {
  if (!value) return '';
  return value.slice(0, 10);
}
