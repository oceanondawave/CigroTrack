/**
 * AI Rate Limit Hook
 * FR-042: Manages AI rate limiting (10/min or 100/day)
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { aiService } from "../services/ai-service"
import type { AiRateLimit } from "@/types"

interface UseAiRateLimitReturn {
  rateLimit: AiRateLimit | null
  loading: boolean
  canUse: boolean
  remaining: number
  resetAt: Date | null
  refresh: () => Promise<void>
}

export function useAiRateLimit(): UseAiRateLimitReturn {
  const [rateLimit, setRateLimit] = useState<AiRateLimit | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchRateLimit = useCallback(async () => {
    try {
      setLoading(true)
      const response = await aiService.getRateLimit()
      if (response.success && response.data) {
        setRateLimit(response.data)
      }
    } catch (err) {
      console.error("Failed to fetch rate limit:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRateLimit()
  }, [fetchRateLimit])

  // Compute remaining requests and rate limit status
  const MAX_REQUESTS_PER_DAY = 100
  const MAX_REQUESTS_PER_MINUTE = 10

  const remaining = rateLimit
    ? Math.max(0, MAX_REQUESTS_PER_DAY - rateLimit.dailyCount)
    : 0

  const canUse = rateLimit
    ? rateLimit.dailyCount < MAX_REQUESTS_PER_DAY && rateLimit.requestsPerMinute < MAX_REQUESTS_PER_MINUTE
    : false

  const resetAt = rateLimit?.dailyResetAt ? new Date(rateLimit.dailyResetAt) : null

  return {
    rateLimit,
    loading,
    canUse,
    remaining,
    resetAt,
    refresh: fetchRateLimit,
  }
}

