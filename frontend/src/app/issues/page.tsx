"use client"

import { useState } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockIssues } from "@/lib/mock-data"
import { Search, Filter, Plus, SlidersHorizontal } from "lucide-react"

export default function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const filteredIssues = mockIssues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
            <p className="text-muted-foreground mt-2">Track and manage all your issues</p>
          </div>
          <Link href="/issues/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Issue
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Backlog">Backlog</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardContent className="pt-6">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No issues found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <Link key={issue.id} href={`/issues/${issue.id}`}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${
                          issue.priority === "high"
                            ? "bg-red-500"
                            : issue.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{issue.title}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {issue.status}
                          </Badge>
                          {issue.labels.map((label) => (
                            <Badge key={label} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{issue.assignee}</span>
                        <span>{issue.dueDate}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
