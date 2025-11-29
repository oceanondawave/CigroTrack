/**
 * AI Suggestion Button Component
 * FR-041: Get AI-powered solution suggestions
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, AlertCircle, Lightbulb } from "lucide-react"
import { aiService } from "../services/ai-service"
import { useAiRateLimit } from "../hooks/use-ai-rate-limit"
import { DATA_LIMITS } from "@/lib/constants"

interface AiSuggestionButtonProps {
  issueId: string
  issueDescription?: string
}

export function AiSuggestionButton({ issueId, issueDescription }: AiSuggestionButtonProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { canUse, remaining, resetAt, refresh } = useAiRateLimit()

  const canGenerate =
    canUse &&
    issueDescription &&
    issueDescription.length >= DATA_LIMITS.AI_MIN_DESCRIPTION_LENGTH

  const handleGenerate = async () => {
    if (!canGenerate) return

    if (!issueDescription) {
      setError("Issue description is required")
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await aiService.getSuggestions(issueId, issueDescription)
      if (response.success && response.data) {
        setSuggestions(response.data)
        await refresh()
      } else {
        const errorMessage = response.error?.message || "Failed to get suggestions"
        if (errorMessage.toLowerCase().includes("rate limit") || errorMessage.toLowerCase().includes("limit")) {
          setError("Rate limit exceeded. Please try again later.")
        } else {
          setError(errorMessage)
        }
        await refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get suggestions")
    } finally {
      setLoading(false)
    }
  }

  if (!canGenerate && suggestions.length === 0) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Issue description must be at least {DATA_LIMITS.AI_MIN_DESCRIPTION_LENGTH} characters.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          AI Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating suggestions...
          </div>
        ) : error ? (
          <div className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : suggestions.length > 0 ? (
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Get AI-powered solution suggestions for this issue.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={!canUse || loading}
              size="sm"
              variant="outline"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Get Suggestions
            </Button>
          </div>
        )}
        {!loading && suggestions.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {remaining} requests remaining
            {resetAt && ` (resets ${resetAt.toLocaleTimeString()})`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

