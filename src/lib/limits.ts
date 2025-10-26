/**
 * Check if user can save more prompts
 * @param userId - The user ID
 * @param currentSaveCount - Current number of saved prompts
 * @returns True if user can save more, false otherwise
 */
export function canSaveMore(_userId: string, currentSaveCount: number): boolean {
  // Default limit: 1000 saves per user
  const SAVE_LIMIT = 1000
  return currentSaveCount < SAVE_LIMIT
}
/**
 * Check if user can fork more prompts
 * @param userId - The user ID
 * @param currentForkCount - Current number of forked prompts this month
 * @returns True if user can fork more, false otherwise
 */
export function canForkMore(_userId: string, currentForkCount: number): boolean {
  // Default limit: 100 forks per user per month
  const FORK_LIMIT = 100
  return currentForkCount < FORK_LIMIT
}

/**
 * Get count of user's forks in current month
 * Get number of forks this month for a user
 * @param userId - The user ID
 * @returns Number of forks created this month
 */
export function getForksThisMonth(_userId: string): number {
  // This would query the database in production
  // For now, returning mock data
  return 0
}

/**
 * Get user's save limit display text
 * Check if user has reached their save limit
 * @param userId - The user ID
 * @returns True if user has reached limit, false otherwise
 */
export function hasReachedSaveLimit(userId: string): boolean {
  return !canSaveMore(userId, 1000)
}

/**
 * Get user's fork limit display text
 * Check if user has reached their fork limit
 * @param userId - The user ID
 * @returns True if user has reached limit, false otherwise
 */
export function hasReachedForkLimit(userId: string): boolean {
  return !canForkMore(userId, 100)
}