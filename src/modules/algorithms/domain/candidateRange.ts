export interface CandidateEntry {
  value: number | null
  key: string
}

/** Keep exact values at the supplied anchors; omitted integers get an explicit gap. */
export function candidateRangeEntries(n: number, anchors: readonly number[]): CandidateEntry[] {
  const candidates =
    n <= 16
      ? Array.from({ length: n + 1 }, (_, value) => value)
      : [...new Set([0, n, ...anchors])]
          .filter((value) => Number.isSafeInteger(value) && value >= 0 && value <= n)
          .sort((a, b) => a - b)
  return candidates.flatMap((value, index) => {
    const previous = candidates[index - 1]
    return previous !== undefined && value - previous > 1
      ? [
          { value: null, key: `gap-${value}` },
          { value, key: String(value) },
        ]
      : [{ value, key: String(value) }]
  })
}
