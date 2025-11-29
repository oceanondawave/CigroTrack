/**
 * AI Summary Hook
 * FR-040: Manages AI summary generation with caching
 */

"use client"

import { useState, useCallback } from "react"
import { aiService } from "../services/ai-service"
import { useAiRateLimit } from "./use-ai-rate-limit"
import type { AiSummary } from "@/types"

interface UseAiSummaryReturn {
  summary: AiSummary | null
  loading: boolean
  error: string | null
  generate: (description: string) => Promise<void>
  clear: () => void
}

export function useAiSummary(issueId: string): UseAiSummaryReturn {
  const [summary, setSummary] = useState<AiSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { canUse, refresh: refreshRateLimit } = useAiRateLimit()

  const generate = useCallback(
    async (description: string) => {
      if (!canUse) {
        setError("Rate limit exceeded. Please try again later.")
        return
      }

      try {
        setLoading(true)
        setError(null)
        const response = await aiService.generateSummary(issueId, description)
        if (response.success && response.data) {
          // Backend returns { summary: string }, transform to AiSummary format
          const summaryText = response.data.summary || ""
          setSummary({
            id: `summary-${issueId}`,
            issueId,
            summary: summaryText,
            cachedAt: new Date().toISOString(),
          })
          await refreshRateLimit() // Update rate limit after use
        } else {
          const errorMessage = response.error?.message || "Failed to generate summary"
          if (errorMessage.toLowerCase().includes("rate limit") || errorMessage.toLowerCase().includes("limit")) {
            setError("Rate limit exceeded. Please try again later.")
          } else {
            setError(errorMessage)
          }
          await refreshRateLimit()
        }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate summary")
    } finally {
      setLoading(false)
    }
  }, [issueId, canUse, refreshRateLimit])

  const clear = useCallback(() => {
    setSummary(null)
    setError(null)
  }, [])

  return {
    summary,
    loading,
    error,
    generate,
    clear,
  }
}

