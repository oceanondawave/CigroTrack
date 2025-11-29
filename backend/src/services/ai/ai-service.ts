/**
 * AI Service
 * Handles AI-powered features (summaries, suggestions, auto-labeling, duplicate detection)
 * FR-040 to FR-045
 */

import { supabaseAdmin } from '../../config/supabase'

export interface AiSummary {
  id: string
  issueId: string
  summary: string
  cachedAt: string
}

export interface AiSuggestion {
  id: string
  issueId: string
  suggestion: string
  cachedAt: string
}

export interface AiRateLimit {
  userId: string
  requestsPerMinute: number
  requestsPerDay: number
  lastRequestAt?: string
  dailyCount: number
  dailyResetAt: string
}

const MAX_REQUESTS_PER_MINUTE = 10 // FR-042
const MAX_REQUESTS_PER_DAY = 100 // FR-042
const MIN_DESCRIPTION_LENGTH = 10 // FR-040, FR-041

export class AiService {
  /**
   * Check rate limit for user
   */
  async checkRateLimit(userId: string): Promise<AiRateLimit> {
    const { data: rateLimitData, error } = await supabaseAdmin
      .from('ai_rate_limits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // Create new rate limit entry
      const now = new Date()
      const resetAt = new Date(now)
      resetAt.setHours(24, 0, 0, 0) // Reset at midnight

      const { data: newRateLimit, error: createError } = await supabaseAdmin
        .from('ai_rate_limits')
        .insert({
          user_id: userId,
          requests_per_minute: 0,
          requests_per_day: 0,
          daily_count: 0,
          daily_reset_at: resetAt.toISOString(),
        })
        .select()
        .single()

      if (createError) {
        throw new Error('Failed to initialize rate limit')
      }

      return this.mapDbRateLimitToRateLimit(newRateLimit)
    }

    if (error) {
      throw new Error('Failed to check rate limit')
    }

    // Check if daily reset is needed
    const now = new Date()
    const resetAt = new Date(rateLimitData.daily_reset_at)

    if (now > resetAt) {
      // Reset daily count
      const newResetAt = new Date(now)
      newResetAt.setHours(24, 0, 0, 0)

      await supabaseAdmin
        .from('ai_rate_limits')
        .update({
          daily_count: 0,
          requests_per_minute: 0,
          daily_reset_at: newResetAt.toISOString(),
        })
        .eq('user_id', userId)

      return {
        userId,
        requestsPerMinute: 0,
        requestsPerDay: MAX_REQUESTS_PER_DAY,
        dailyCount: 0,
        dailyResetAt: newResetAt.toISOString(),
      }
    }

    return this.mapDbRateLimitToRateLimit(rateLimitData)
  }

  /**
   * Increment rate limit counters
   */
  async incrementRateLimit(userId: string): Promise<void> {
    const rateLimit = await this.checkRateLimit(userId)

    const now = new Date()
    const lastRequest = rateLimit.lastRequestAt ? new Date(rateLimit.lastRequestAt) : null
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)

    // Reset per-minute counter if last request was more than 1 minute ago
    const requestsPerMinute = lastRequest && lastRequest > oneMinuteAgo ? rateLimit.requestsPerMinute + 1 : 1

    await supabaseAdmin
      .from('ai_rate_limits')
      .update({
        requests_per_minute: requestsPerMinute,
        requests_per_day: rateLimit.requestsPerDay - 1,
        daily_count: rateLimit.dailyCount + 1,
        last_request_at: now.toISOString(),
      })
      .eq('user_id', userId)
  }

  /**
   * FR-040: Generate Issue Summary
   */
  async generateSummary(issueId: string, userId: string, description: string): Promise<string> {
    // Check rate limit
    const rateLimit = await this.checkRateLimit(userId)

    if (rateLimit.dailyCount >= MAX_REQUESTS_PER_DAY) {
      throw new Error('Daily AI request limit exceeded. Please try again tomorrow.')
    }

    if (rateLimit.requestsPerMinute >= MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Too many requests. Please wait a minute and try again.')
    }

    // Validate description length
    if (!description || description.length < MIN_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be at least ${MIN_DESCRIPTION_LENGTH} characters for AI summary`)
    }

    // Check cache
    const { data: cachedSummary } = await supabaseAdmin
      .from('ai_summaries')
      .select('*')
      .eq('issue_id', issueId)
      .single()

    if (cachedSummary) {
      // Return cached summary
      return cachedSummary.summary
    }

    // TODO: Integrate with actual AI service (OpenAI, Anthropic, etc.)
    // For now, return a placeholder
    const summary = `Summary of issue: ${description.substring(0, 100)}...`

    // Cache the summary
    await supabaseAdmin.from('ai_summaries').insert({
      issue_id: issueId,
      summary,
    })

    // Increment rate limit
    await this.incrementRateLimit(userId)

    return summary
  }

  /**
   * FR-041: Generate Solution Suggestion
   */
  async generateSuggestion(issueId: string, userId: string, description: string): Promise<string> {
    // Check rate limit
    const rateLimit = await this.checkRateLimit(userId)

    if (rateLimit.dailyCount >= MAX_REQUESTS_PER_DAY) {
      throw new Error('Daily AI request limit exceeded. Please try again tomorrow.')
    }

    if (rateLimit.requestsPerMinute >= MAX_REQUESTS_PER_MINUTE) {
      throw new Error('Too many requests. Please wait a minute and try again.')
    }

    // Validate description length
    if (!description || description.length < MIN_DESCRIPTION_LENGTH) {
      throw new Error(`Description must be at least ${MIN_DESCRIPTION_LENGTH} characters for AI suggestion`)
    }

    // TODO: Integrate with actual AI service
    const suggestion = `Suggested approach: Review the issue details and consider standard troubleshooting steps.`

    // Increment rate limit
    await this.incrementRateLimit(userId)

    return suggestion
  }

  /**
   * FR-043: Auto-label Issue
   */
  async autoLabelIssue(issueId: string, userId: string, title: string, description?: string): Promise<string[]> {
    // Check rate limit
    const rateLimit = await this.checkRateLimit(userId)

    if (rateLimit.dailyCount >= MAX_REQUESTS_PER_DAY) {
      throw new Error('Daily AI request limit exceeded. Please try again tomorrow.')
    }

    // TODO: Integrate with actual AI service for label suggestions
    // For now, return empty array
    const suggestedLabels: string[] = []

    // Increment rate limit
    await this.incrementRateLimit(userId)

    return suggestedLabels
  }

  /**
   * FR-044: Detect Duplicate Issues
   */
  async detectDuplicates(issueId: string, userId: string, title: string, description?: string): Promise<string[]> {
    // Check rate limit
    const rateLimit = await this.checkRateLimit(userId)

    if (rateLimit.dailyCount >= MAX_REQUESTS_PER_DAY) {
      throw new Error('Daily AI request limit exceeded. Please try again tomorrow.')
    }

    // TODO: Integrate with actual AI service for duplicate detection
    // For now, return empty array
    const duplicateIssueIds: string[] = []

    // Increment rate limit
    await this.incrementRateLimit(userId)

    return duplicateIssueIds
  }

  /**
   * FR-045: Summarize Comments
   */
  async summarizeComments(issueId: string, userId: string, commentCount: number): Promise<string> {
    // Check rate limit
    const rateLimit = await this.checkRateLimit(userId)

    if (rateLimit.dailyCount >= MAX_REQUESTS_PER_DAY) {
      throw new Error('Daily AI request limit exceeded. Please try again tomorrow.')
    }

    if (commentCount < 5) {
      throw new Error('At least 5 comments are required for comment summary')
    }

    // TODO: Integrate with actual AI service
    const summary = 'Summary of comments on this issue...'

    // Increment rate limit
    await this.incrementRateLimit(userId)

    return summary
  }

  /**
   * Get rate limit status
   */
  async getRateLimit(userId: string): Promise<AiRateLimit> {
    return this.checkRateLimit(userId)
  }

  /**
   * Map database rate limit to AiRateLimit type
   */
  private mapDbRateLimitToRateLimit(dbRateLimit: any): AiRateLimit {
    return {
      userId: dbRateLimit.user_id,
      requestsPerMinute: dbRateLimit.requests_per_minute || 0,
      requestsPerDay: dbRateLimit.requests_per_day || MAX_REQUESTS_PER_DAY,
      lastRequestAt: dbRateLimit.last_request_at || undefined,
      dailyCount: dbRateLimit.daily_count || 0,
      dailyResetAt: dbRateLimit.daily_reset_at,
    }
  }
}

export const aiService = new AiService()

