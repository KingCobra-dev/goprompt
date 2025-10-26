/**
 * Get relative time string from a date
 * @param date - ISO date string or Date object
 * @returns Human-readable relative time (e.g., "2h ago", "3d ago")
 * @example
 * getRelativeTime("2024-01-15T10:00:00Z") // "Just now" or "2h ago"
 */
export function getRelativeTime(date: string): string {
  const now = new Date()
  const created = new Date(date)
  const diffInHours = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60)
  )

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h ago`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`

  const diffInMonths = Math.floor(diffInDays / 30)
  return `${diffInMonths}mo ago`
}