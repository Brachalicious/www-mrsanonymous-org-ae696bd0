/** Mask a real name for display: keeps first letter of each word, x-es the rest. */
export function maskName(value: string) {
  return value
    .split(/(\s+)/)
    .map((part) =>
      /\s/.test(part) || part.length === 0
        ? part
        : part[0] + "x".repeat(Math.max(part.length - 1, 2)),
    )
    .join("");
}

export const REAL_NAME_KEY = "realName";

/** Returns a copy of the fields with the real name masked unless `show` is true. */
export function applyNameVisibility(fields: Record<string, string>, show: boolean) {
  const real = (fields?.[REAL_NAME_KEY] ?? "").trim();
  if (!real || show) return fields ?? {};
  return { ...fields, [REAL_NAME_KEY]: maskName(real) };
}
