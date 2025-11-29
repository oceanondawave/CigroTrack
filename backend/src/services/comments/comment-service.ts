/**
 * Comment Service
 * Handles comment-related operations using Supabase
 * FR-060 to FR-063
 */

import { supabaseAdmin } from '../../config/supabase'
import type { Comment } from '../../types'

export interface CreateCommentData {
  issueId: string
  authorId: string
  content: string
}

export interface UpdateCommentData {
  content: string
}

const MAX_COMMENT_LENGTH = 1000 // FR-060

export class CommentService {
  /**
   * FR-060: Create Comment
   */
  async createComment(data: CreateCommentData): Promise<Comment> {
    // Validate content (1-1000 chars)
    if (!data.content || data.content.trim().length === 0) {
      throw new Error('Comment content is required')
    }
    if (data.content.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment must not exceed ${MAX_COMMENT_LENGTH} characters`)
    }

    const { data: commentData, error } = await supabaseAdmin
      .from('comments')
      .insert({
        issue_id: data.issueId,
        author_id: data.authorId,
        content: data.content.trim(),
      })
      .select()
      .single()

    if (error) {
      throw new Error('Failed to create comment')
    }

    return this.mapDbCommentToComment(commentData)
  }

  /**
   * FR-061: Get Comments
   * With pagination
   */
  async getComments(
    issueId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ data: Comment[]; total: number }> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: commentsData, error, count } = await supabaseAdmin
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('issue_id', issueId)
      .eq('deleted', false)
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) {
      throw new Error('Failed to fetch comments')
    }

    return {
      data: (commentsData || []).map((c: any) => this.mapDbCommentToComment(c)),
      total: count || 0,
    }
  }

  /**
   * FR-062: Update Comment
   */
  async updateComment(commentId: string, data: UpdateCommentData, authorId: string): Promise<Comment> {
    // Verify ownership
    const comment = await this.getCommentById(commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.authorId !== authorId) {
      throw new Error('Only comment author can update comment')
    }

    // Validate content
    if (!data.content || data.content.trim().length === 0) {
      throw new Error('Comment content is required')
    }
    if (data.content.length > MAX_COMMENT_LENGTH) {
      throw new Error(`Comment must not exceed ${MAX_COMMENT_LENGTH} characters`)
    }

    const { data: updatedComment, error } = await supabaseAdmin
      .from('comments')
      .update({
        content: data.content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId)
      .select()
      .single()

    if (error) {
      throw new Error('Failed to update comment')
    }

    return this.mapDbCommentToComment(updatedComment)
  }

  /**
   * FR-063: Delete Comment (soft delete)
   */
  async deleteComment(commentId: string, authorId: string): Promise<void> {
    // Verify ownership
    const comment = await this.getCommentById(commentId)
    if (!comment) {
      throw new Error('Comment not found')
    }

    if (comment.authorId !== authorId) {
      throw new Error('Only comment author can delete comment')
    }

    const { error } = await supabaseAdmin
      .from('comments')
      .update({ deleted: true })
      .eq('id', commentId)

    if (error) {
      throw new Error('Failed to delete comment')
    }
  }

  /**
   * Get comment by ID
   */
  async getCommentById(commentId: string): Promise<Comment | null> {
    const { data: commentData, error } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('id', commentId)
      .eq('deleted', false)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error('Failed to fetch comment')
    }

    return this.mapDbCommentToComment(commentData)
  }

  /**
   * Map database comment to Comment type
   */
  private mapDbCommentToComment(dbComment: any): Comment {
    return {
      id: dbComment.id,
      issueId: dbComment.issue_id,
      authorId: dbComment.author_id,
      content: dbComment.content,
      deleted: dbComment.deleted || false,
      createdAt: dbComment.created_at,
      updatedAt: dbComment.updated_at,
    }
  }
}

export const commentService = new CommentService()

