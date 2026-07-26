export function paginateByCursor<T extends { id: number }>(
  items: T[],
  cursor: number | null | undefined,
  size: number,
) {
  const sorted = [...items].sort((a, b) => b.id - a.id)
  const filtered = cursor != null ? sorted.filter((item) => item.id < cursor) : sorted
  const page = filtered.slice(0, size)
  const hasNext = filtered.length > size
  const nextCursor = hasNext && page.length > 0 ? page[page.length - 1]!.id : null

  return { items: page, nextCursor, hasNext }
}
