/**
 * AI Summary Button Component
 * FR-040: Generate and display AI summary for an issue
 */

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, AlertCircle } from "lucide-react"
import { useAiSummary } from "../hooks/use-ai-summary"
import { useAiRateLimit } from "../hooks/use-ai-rate-limit"
import { DATA_LIMITS } from "@/lib/constants"

interface AiSummaryButtonProps {
  issueId: string
  issueDescription?: string
}

export function AiSummaryButton({ issueId, issueDescription }: AiSummaryButtonProps) {
  const { summary, loading, error, generate, clear } = useAiSummary(issueId)
  const { canUse, remaining, resetAt } = useAiRateLimit()

  const canGenerate =
    canUse &&
    issueDescription &&
    issueDescription.length >= DATA_LIMITS.AI_MIN_DESCRIPTION_LENGTH

  const handleGenerate = async () => {
    if (!canGenerate || !issueDescription) return
    await generate(issueDescription)
  }

  if (!canGenerate && !summary) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Issue description must be at least {DATA_LIMITS.AI_MIN_DESCRIPTION_LENGTH} characters to generate a summary.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Summary
          </CardTitle>
          {summary && (
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating summary...
          </div>
        ) : error ? (
          <div className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : summary ? (
          <div className="space-y-2">
            <p className="text-sm whitespace-pre-wrap">{summary.summary}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Generate an AI-powered summary of this issue.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={!canUse || loading}
              size="sm"
              variant="outline"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Summary
            </Button>
          </div>
        )}
        {!loading && !summary && (
          <p className="text-xs text-muted-foreground">
            {remaining} requests remaining
            {resetAt && ` (resets ${resetAt.toLocaleTimeString()})`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

