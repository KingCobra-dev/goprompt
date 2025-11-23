/**
 * Check if user can save more prompts
 * @param user - The user object
 * @param currentSaveCount - Current number of saved prompts
 * @returns Object with allowed status and message
 */
export function canSaveMore(user: any, currentSaveCount: number): { allowed: boolean; message: string } {
  // Temporarily removed save limits
  return { allowed: true, message: '' }
}
/**
 * Check if user can fork more prompts
 * @param user - The user object
 * @param currentForkCount - Current number of forked prompts this month
 * @returns Object with allowed status and message
 */
export function canForkMore(user: any, currentForkCount: number): { allowed: boolean; message: string } {
  // Pro users have higher limits
  const isPro = user?.role === 'pro' || user?.subscriptionStatus === 'active'
  const FORK_LIMIT = isPro ? 500 : 100

  if (currentForkCount >= FORK_LIMIT) {
    const limitText = isPro ? '500' : '100'
    return {
      allowed: false,
      message: `Fork limit reached (${limitText} forks per month). ${!isPro ? 'Upgrade to Pro for higher limits!' : ''}`
    }
  }

  return { allowed: true, message: '' }
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