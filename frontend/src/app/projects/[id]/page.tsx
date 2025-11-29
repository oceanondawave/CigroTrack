"use client"

import { useState } from "react"
import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockIssues } from "@/lib/mock-data"
import { Star, Settings, Archive, MoreVertical, Plus, LayoutGrid } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ProjectDetailPage() {
  const [favorite, setFavorite] = useState(true)
  const projectIssues = mockIssues.filter((i) => i.projectId === "1")

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Project Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Mobile App Redesign</h1>
              <button onClick={() => setFavorite(!favorite)} className="mt-1">
                <Star className={`h-5 w-5 ${favorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
              </button>
            </div>
            <p className="text-muted-foreground">Complete redesign of the mobile application</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/projects/1/board`}>
              <Button variant="outline">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Board View
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Project Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete Project</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="issues">
              Issues
              <Badge variant="secondary" className="ml-2">
                {projectIssues.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Issues</CardDescription>
                  <CardTitle className="text-3xl">{projectIssues.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>In Progress</CardDescription>
                  <CardTitle className="text-3xl">
                    {projectIssues.filter((i) => i.status === "In Progress").length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Completed</CardDescription>
                  <CardTitle className="text-3xl">{projectIssues.filter((i) => i.status === "Done").length}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates in this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectIssues.slice(0, 3).map((issue) => (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            issue.priority === "high"
                              ? "bg-red-500"
                              : issue.priority === "medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {issue.status} • {issue.assignee}
                          </p>
                        </div>
                      </div>
                      <Link href={`/issues/${issue.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Issues</CardTitle>
                    <CardDescription>Manage issues for this project</CardDescription>
                  </div>
                  <Link href="/issues/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Issue
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectIssues.map((issue) => (
                    <Link key={issue.id} href={`/issues/${issue.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              issue.priority === "high"
                                ? "bg-red-500"
                                : issue.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{issue.title}</p>
                            <div className="flex items-center gap-2 mt-1">
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
                        </div>
                        <div className="text-xs text-muted-foreground">{issue.dueDate}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
