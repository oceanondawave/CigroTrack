/**
 * Comment List Component
 * FR-061: Display comments in chronological order with pagination
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2, MoreVertical, Edit2, Trash2 } from "lucide-react"
import { useComments } from "../hooks/use-comments"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { CommentForm } from "./comment-form"
import { format } from "date-fns"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"

interface CommentListProps {
  issueId: string
}

export function CommentList({ issueId }: CommentListProps) {
  const { user } = useAuth()
  const {
    comments,
    loading,
    error,
    hasMore,
    updateComment,
    deleteComment,
    loadMore,
    refreshComments,
  } = useComments(issueId)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editLoading, setEditLoading] = useState(false)

  const handleEdit = (commentId: string, currentContent: string) => {
    setEditingId(commentId)
    setEditContent(currentContent)
  }

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return
    setEditLoading(true)
    try {
      await updateComment(commentId, editContent.trim())
      setEditingId(null)
      setEditContent("")
    } catch (err) {
      console.error("Failed to update comment:", err)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return
    }
    try {
      await deleteComment(commentId)
    } catch (err) {
      console.error("Failed to delete comment:", err)
    }
  }

  if (loading && comments.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
        <CardDescription>
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comments */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const isAuthor = comment.authorId === user?.id
              const isEditing = editingId === comment.id

              return (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>
                      {comment.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-sm">
                          {comment.author.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {comment.createdAt !== comment.updatedAt && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (edited)
                          </span>
                        )}
                      </div>
                      {isAuthor && !isEditing && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(comment.id, comment.content)}
                            >
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(comment.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          disabled={editLoading}
                        />
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={editLoading || !editContent.trim()}
                          >
                            {editLoading ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setEditContent("")
                            }}
                            disabled={editLoading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={loadMore} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More Comments"
              )}
            </Button>
          </div>
        )}

        {/* Comment Form */}
        <div className="pt-4 border-t border-border/60">
          <CommentForm issueId={issueId} onSuccess={refreshComments} />
        </div>
      </CardContent>
    </Card>
  )
}

