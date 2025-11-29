/**
 * Issues List Component
 * FR-036: Display issues with filtering and sorting
 */

"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Filter as FilterIcon } from "lucide-react"
import { useIssues } from "../hooks/use-issues"
import { CreateIssueDialog } from "./create-issue-dialog"
import { IssueCard } from "./issue-card"
import { IssueFilters } from "./issue-filters"
import type { IssueFilters as IssueFiltersType, SortOption } from "@/types"
import { useTeam } from "@/features/teams/hooks/use-team"

interface IssuesListProps {
  projectId: string
  teamId?: string
}

export function IssuesList({ projectId, teamId }: IssuesListProps) {
  const [filters, setFilters] = useState<IssueFiltersType>({})
  const [sort, setSort] = useState<SortOption>({
    field: "createdAt",
    direction: "desc",
  })
  const [showFilters, setShowFilters] = useState(false)

  const {
    issues,
    loading,
    error,
    total,
    hasMore,
    createIssue,
    loadMore,
    setFilters: setFiltersInternal,
    setSort: setSortInternal,
    refreshIssues,
  } = useIssues(projectId, filters, sort)

  // Get team members for assignee filter
  const { members } = teamId ? useTeam(teamId) : { members: [] }

  const handleFiltersChange = (newFilters: IssueFiltersType) => {
    setFilters(newFilters)
    setFiltersInternal(newFilters)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort)
    setSortInternal(newSort)
  }

  const handleClearFilters = () => {
    const cleared = {}
    setFilters(cleared)
    setFiltersInternal(cleared)
  }

  const handleIssueCreated = async (issueId: string) => {
    await refreshIssues()
  }

  if (loading && issues.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Issues</h2>
          <p className="text-muted-foreground">
            {total} issue{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <CreateIssueDialog
            projectId={projectId}
            teamMembers={members}
            onSuccess={handleIssueCreated}
          />
        </div>
      </div>

      {showFilters && (
        <IssueFilters
          filters={filters}
          sort={sort}
          onFiltersChange={handleFiltersChange}
          onSortChange={handleSortChange}
          onClear={handleClearFilters}
          assignees={members.map((m) => ({ id: m.userId, name: m.user.name }))}
        />
      )}

      {issues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No issues found. Create your first issue to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

