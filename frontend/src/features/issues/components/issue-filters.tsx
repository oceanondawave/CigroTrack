/**
 * Issue Filters Component
 * FR-036: Filter and search issues
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import type { IssueFilters, SortOption, IssueStatus, Priority } from "@/types"
import { DEFAULT_ISSUE_STATUSES, PRIORITY_LEVELS } from "@/lib/constants"

interface IssueFiltersProps {
  filters: IssueFilters
  sort: SortOption
  onFiltersChange: (filters: IssueFilters) => void
  onSortChange: (sort: SortOption) => void
  onClear: () => void
  statusOptions?: string[]
  assignees?: Array<{ id: string; name: string }>
}

export function IssueFilters({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onClear,
  statusOptions = [...DEFAULT_ISSUE_STATUSES],
  assignees = [],
}: IssueFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || "")

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const hasActiveFilters =
    filters.status?.length ||
    filters.priority?.length ||
    filters.assigneeId ||
    filters.hasDueDate ||
    filters.dueDateFrom ||
    filters.dueDateTo ||
    filters.search

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search by Title</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={filters.status?.[0] || "all"}
              onValueChange={(value) => {
                onFiltersChange({
                  ...filters,
                  status: value === "all" ? undefined : [value as IssueStatus],
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={filters.priority?.[0] || "all"}
              onValueChange={(value) => {
                onFiltersChange({
                  ...filters,
                  priority:
                    value === "all" ? undefined : [value as Priority],
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {PRIORITY_LEVELS.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Assignee Filter */}
        {assignees.length > 0 && (
          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={filters.assigneeId || "all"}
              onValueChange={(value) => {
                onFiltersChange({
                  ...filters,
                  assigneeId: value === "all" ? undefined : value,
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={sort.field}
              onValueChange={(value) => {
                onSortChange({ ...sort, field: value as SortOption["field"] })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="updatedAt">Last Modified</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort.direction}
              onValueChange={(value) => {
                onSortChange({
                  ...sort,
                  direction: value as "asc" | "desc",
                })
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

