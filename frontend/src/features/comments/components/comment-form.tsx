/**
 * Comment Form Component
 * FR-060: Create a new comment
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { useComments } from "../hooks/use-comments"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { validators } from "@/lib/utils/validation"
import { FIELD_LIMITS } from "@/lib/constants"

interface CommentFormProps {
  issueId: string
  onSuccess?: () => void
}

export function CommentForm({ issueId, onSuccess }: CommentFormProps) {
  const { user } = useAuth()
  const { createComment } = useComments(issueId)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate content (FR-060: 1-1000 characters)
    if (!validators.commentContent(content.trim())) {
      setError(
        `Comment must be between ${FIELD_LIMITS.COMMENT_CONTENT.min} and ${FIELD_LIMITS.COMMENT_CONTENT.max} characters`
      )
      return
    }

    setLoading(true)
    try {
      await createComment(content.trim())
      setContent("")
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment")
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value)
                setError(null)
              }}
              rows={3}
              maxLength={FIELD_LIMITS.COMMENT_CONTENT.max}
              disabled={loading}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {content.length}/{FIELD_LIMITS.COMMENT_CONTENT.max} characters
              </p>
              <Button type="submit" disabled={loading || !content.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

