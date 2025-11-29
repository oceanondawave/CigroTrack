"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockIssues, mockProjects } from "@/lib/mock-data"
import { AlertCircle, CheckCircle2, Clock, TrendingUp, Star, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const totalIssues = mockIssues.length
  const inProgress = mockIssues.filter((i) => i.status === "In Progress").length
  const completed = mockIssues.filter((i) => i.status === "Done").length
  const overdue = 2

  const myIssues = mockIssues.filter((i) => i.assignee === "Alex Johnson")
  const dueSoon = mockIssues.filter((i) => i.dueDate).slice(0, 3)
  const favoriteProjects = mockProjects.filter((p) => p.favorite)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalIssues}</div>
              <p className="text-xs text-muted-foreground mt-1">+2 from last week</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgress}</div>
              <p className="text-xs text-muted-foreground mt-1">Across 3 projects</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completed}</div>
              <p className="text-xs text-muted-foreground mt-1">This sprint</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overdue}</div>
              <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
            </CardContent>
          </Card>
        </div>


        {/* My Issues */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Issues</CardTitle>
                  <CardDescription>Issues assigned to you</CardDescription>
                </div>
                <Link href="/issues">
                  <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myIssues.map((issue) => (
                  <Link key={issue.id} href={`/issues/${issue.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-accent/30 border border-border/60 hover:bg-accent/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full shadow-lg ${
                            issue.priority === "high"
                              ? "bg-red-500 shadow-red-500/50"
                              : issue.priority === "medium"
                                ? "bg-yellow-500 shadow-yellow-500/50"
                                : "bg-green-500 shadow-green-500/50"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">{issue.status}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs backdrop-blur-sm">
                        {issue.dueDate}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Due Soon */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Due Soon</CardTitle>
              <CardDescription>Issues with upcoming deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dueSoon.map((issue) => (
                  <Link key={issue.id} href={`/issues/${issue.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-accent/30 border border-border/60 hover:bg-accent/50 transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{issue.title}</p>
                          <p className="text-xs text-muted-foreground">{issue.assignee}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs backdrop-blur-sm">
                        {issue.dueDate}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Favorite Projects */}
        <Card className="backdrop-blur-md bg-card/80 border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500 drop-shadow-lg" />
                  Favorite Projects
                </CardTitle>
                <CardDescription>Quick access to your starred projects</CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="hover:bg-accent/50">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {favoriteProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="backdrop-blur-sm bg-accent/30 hover:bg-accent/50 transition-all cursor-pointer shadow-sm">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="backdrop-blur-sm">
                            {project.issueCount} issues
                          </Badge>
                          <Badge
                            variant={project.status === "active" ? "default" : "secondary"}
                            className="backdrop-blur-sm"
                          >
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
