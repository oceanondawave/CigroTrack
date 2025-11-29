"use client"

import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-2">Insights and metrics across your teams and projects</p>
          </div>
          <Select defaultValue="30">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="team" className="space-y-4">
          <TabsList>
            <TabsTrigger value="team">Team Analytics</TabsTrigger>
            <TabsTrigger value="project">Project Analytics</TabsTrigger>
            <TabsTrigger value="velocity">Velocity</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Issues per Member</CardTitle>
                  <CardDescription>Created vs completed issues by team member</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Alex</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Created: 12</span>
                        <span className="text-muted-foreground">Completed: 10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Sarah</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Created: 8</span>
                        <span className="text-muted-foreground">Completed: 9</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Mike</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Created: 15</span>
                        <span className="text-muted-foreground">Completed: 11</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Emma</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Created: 5</span>
                        <span className="text-muted-foreground">Completed: 7</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Completion Rate Trend</CardTitle>
                  <CardDescription>Weekly completion rate percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Week 1</span>
                      <span className="text-sm font-semibold">75%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Week 2</span>
                      <span className="text-sm font-semibold">82%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Week 3</span>
                      <span className="text-sm font-semibold">68%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <span className="text-sm font-medium">Week 4</span>
                      <span className="text-sm font-semibold">91%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Average Resolution Time</CardDescription>
                  <CardTitle className="text-3xl">3.2 days</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-green-500">-0.5 days from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Team Velocity</CardDescription>
                  <CardTitle className="text-3xl">28 pts</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-green-500">+3 pts from last sprint</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Active Contributors</CardDescription>
                  <CardTitle className="text-3xl">12</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Across 3 teams</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="project" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Project & Status</CardTitle>
                <CardDescription>Current issue distribution across projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-3">Mobile App</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Backlog: 8</span>
                      <span className="text-primary">In Progress: 4</span>
                      <span className="text-green-500">Done: 12</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-3">API v2</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Backlog: 5</span>
                      <span className="text-primary">In Progress: 3</span>
                      <span className="text-green-500">Done: 10</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <h3 className="font-semibold mb-3">Marketing</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Backlog: 3</span>
                      <span className="text-primary">In Progress: 2</span>
                      <span className="text-green-500">Done: 7</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Mobile App</CardTitle>
                  <CardDescription>24 total issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">50%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "50%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">API v2</CardTitle>
                  <CardDescription>18 total issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">56%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "56%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Marketing</CardTitle>
                  <CardDescription>12 total issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion</span>
                      <span className="font-medium">58%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "58%" }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="velocity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sprint Velocity</CardTitle>
                <CardDescription>Story points completed per sprint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-sm font-medium">Sprint 1</span>
                    <span className="text-sm font-semibold">23 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-sm font-medium">Sprint 2</span>
                    <span className="text-sm font-semibold">28 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-sm font-medium">Sprint 3</span>
                    <span className="text-sm font-semibold">25 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-sm font-medium">Sprint 4</span>
                    <span className="text-sm font-semibold">31 pts</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <span className="text-sm font-medium">Sprint 5</span>
                    <span className="text-sm font-semibold">29 pts</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Average Velocity</CardDescription>
                  <CardTitle className="text-3xl">27.2</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Story points per sprint</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Best Sprint</CardDescription>
                  <CardTitle className="text-3xl">31</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Sprint 4</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Trend</CardDescription>
                  <CardTitle className="text-3xl text-green-500">+14%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Over last 5 sprints</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Consistency</CardDescription>
                  <CardTitle className="text-3xl">92%</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">Predictability score</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
