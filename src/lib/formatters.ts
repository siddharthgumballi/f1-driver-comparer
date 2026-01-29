// Formatting utilities for F1 Driver Comparer

export function numberFmt(n: number | null | undefined, digits = 0): string {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function formatPercentage(value: number, total: number, decimals = 1): string {
  if (total === 0) return '0.0%'
  return ((value / total) * 100).toFixed(decimals) + '%'
}

export function formatPosition(position: number | null | undefined): string {
  if (position === null || position === undefined) return '—'
  const suffix = getOrdinalSuffix(position)
  return `${position}${suffix}`
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}

export function formatYearRange(from: number, to: number): string {
  if (from === to) return `${from}`
  return `${from}–${to}`
}

export function formatDriverName(givenName: string, familyName: string): string {
  return `${givenName} ${familyName}`
}

export function formatStatValue(value: number | null | undefined, isInteger: boolean = true): string {
  if (value === null || value === undefined) return '—'
  return numberFmt(value, isInteger ? 0 : 2)
}
