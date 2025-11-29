"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockComments, mockIssueHistory, mockSubtasks } from "@/lib/mock-data"
import { ArrowLeft, Calendar, User, Tag, Flag, Sparkles, Trash2, Edit, Clock, GripVertical } from "lucide-react"
import Link from "next/link"

export default function IssueDetailPage() {
  const [status, setStatus] = useState("In Progress")
  const [priority, setPriority] = useState("high")
  const [comment, setComment] = useState("")
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false)

  const generateAISummary = () => {
    setAiSummaryLoading(true)
    setTimeout(() => {
      setAiSummaryLoading(false)
    }, 2000)
  }

  const generateAISuggestion = () => {
    setAiSuggestionLoading(true)
    setTimeout(() => {
      setAiSuggestionLoading(false)
    }, 2000)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back button */}
        <Link href="/issues">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Issues
          </Button>
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Fix login button alignment</h1>
            </div>

            {/* AI Features */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiSummaryLoading ? (
                    <div className="text-sm text-muted-foreground">Generating summary...</div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Button alignment issue caused by flexbox container. Affects mobile and tablet views.
                      </p>
                      <Button variant="link" size="sm" className="px-0 h-auto mt-2" onClick={generateAISummary}>
                        Regenerate
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Suggestion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiSuggestionLoading ? (
                    <div className="text-sm text-muted-foreground">Generating suggestion...</div>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Consider using CSS Grid instead of Flexbox for better alignment control.
                      </p>
                      <Button variant="link" size="sm" className="px-0 h-auto mt-2" onClick={generateAISuggestion}>
                        Get More Suggestions
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The login button on the authentication page is not properly aligned with the input fields. This causes
                  visual inconsistency and poor UX on mobile devices.
                </p>
              </CardContent>
            </Card>

            {/* Subtasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subtasks</CardTitle>
                  <CardDescription>
                    {mockSubtasks.filter((s) => s.completed).length} of {mockSubtasks.length} completed
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockSubtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Checkbox checked={subtask.completed} />
                    <span className={`text-sm flex-1 ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                  Add Subtask
                </Button>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Tabs defaultValue="comments" className="space-y-4">
              <TabsList>
                <TabsTrigger value="comments">
                  Comments
                  <Badge variant="secondary" className="ml-2">
                    {mockComments.filter((c) => !c.deleted).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className={`flex gap-3 ${comment.deleted ? "opacity-50" : ""}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.authorAvatar || "/placeholder.svg"} />
                          <AvatarFallback>{comment.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                            {!comment.deleted && (
                              <div className="ml-auto flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?key=8a7pw" />
                        <AvatarFallback>AJ</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={3}
                        />
                        <Button size="sm">Post Comment</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {mockIssueHistory.map((entry) => (
                        <div key={entry.id} className="flex gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm">
                              <span className="font-medium">{entry.user}</span> {entry.action}
                            </p>
                            <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Status
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Backlog">Backlog</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    Priority
                  </label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Assignee
                  </label>
                  <Select defaultValue="sarah">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sarah">Sarah Chen</SelectItem>
                      <SelectItem value="alex">Alex Johnson</SelectItem>
                      <SelectItem value="mike">Mike Rodriguez</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </label>
                  <Input type="date" defaultValue="2024-12-15" />
                </div>

                {/* Labels */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Labels
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">bug</Badge>
                    <Badge variant="secondary">ui</Badge>
                    <Button variant="outline" size="sm">
                      + Add Label
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Detect Duplicates
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Tag className="mr-2 h-4 w-4" />
                  Auto-Label
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
