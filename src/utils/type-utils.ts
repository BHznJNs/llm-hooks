export function nullToUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}
export function undefinedToNull<T>(value: T | null | undefined): T | null {
  return value ?? null;
}
