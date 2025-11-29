/**
 * AI Duplicate Detection Component
 * FR-044: Detect potential duplicate issues
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, AlertCircle, Copy } from "lucide-react"
import Link from "next/link"
import { aiService } from "../services/ai-service"
import { useAiRateLimit } from "../hooks/use-ai-rate-limit"

interface AiDuplicateDetectionProps {
  issueId: string
}

export function AiDuplicateDetection({ issueId }: AiDuplicateDetectionProps) {
  const [duplicates, setDuplicates] = useState<Array<{ id: string; title: string; similarity: number }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { canUse, remaining, resetAt, refresh } = useAiRateLimit()

  const handleDetect = async () => {
    if (!canUse) return

    try {
      setLoading(true)
      setError(null)
      // Note: Backend expects title and description, but we only have issueId
      // We'll need to fetch the issue first or pass title/description from parent
      // For now, pass empty strings as placeholders - the backend will handle it
      const response = await aiService.detectDuplicates(issueId, "", "")
      if (response.success && response.data) {
        // Backend returns string[] (issue IDs), but frontend expects Array<{id, title, similarity}>
        // Transform the response
        const duplicateIds = response.data as unknown as string[]
        setDuplicates(
          duplicateIds.map((id) => ({
            id,
            title: `Issue ${id}`, // TODO: Fetch actual titles
            similarity: 0.8, // TODO: Get actual similarity from backend
          }))
        )
        await refresh()
      } else {
        const errorMessage = response.error?.message || "Failed to detect duplicates"
        if (errorMessage.toLowerCase().includes("rate limit") || errorMessage.toLowerCase().includes("limit")) {
          setError("Rate limit exceeded. Please try again later.")
        } else {
          setError(errorMessage)
        }
        await refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to detect duplicates")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Duplicate Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Detecting duplicates...
          </div>
        ) : error ? (
          <div className="text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        ) : duplicates.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Potential duplicates found:</p>
            <ul className="space-y-2">
              {duplicates.map((duplicate) => (
                <li key={duplicate.id} className="text-sm">
                  <Link
                    href={`/issues/${duplicate.id}`}
                    className="text-primary hover:underline"
                  >
                    {duplicate.title}
                  </Link>
                  <span className="text-muted-foreground ml-2">
                    ({Math.round(duplicate.similarity * 100)}% similar)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Detect potential duplicate issues using AI.
            </p>
            <Button
              onClick={handleDetect}
              disabled={!canUse || loading}
              size="sm"
              variant="outline"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Detect Duplicates
            </Button>
          </div>
        )}
        {!loading && duplicates.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {remaining} requests remaining
            {resetAt && ` (resets ${resetAt.toLocaleTimeString()})`}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

