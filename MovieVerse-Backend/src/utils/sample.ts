/** Return up to `n` random elements from `arr` (Fisher–Yates partial shuffle). */
export function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const count = Math.min(n, copy.length);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export function parsePagination(query: Record<string, unknown>) {
  let page = Number.parseInt(String(query.page ?? '1'), 10);
  let pageSize = Number.parseInt(String(query.page_size ?? '24'), 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(pageSize)) pageSize = 24;
  pageSize = Math.max(1, Math.min(pageSize, 60));
  return { page, pageSize };
}
