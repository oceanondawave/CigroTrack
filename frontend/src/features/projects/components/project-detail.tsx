/**
 * Project Detail Component
 * FR-022: Project detail page with info, statistics, and tabs
 */

"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Archive, Star, Settings, CheckSquare } from "lucide-react"
import { useProject } from "../hooks/use-project"
import { useAuth } from "@/features/auth/hooks/use-auth"
import { IssuesList } from "@/features/issues/components/issues-list"
import { KanbanBoard } from "@/features/kanban/components/kanban-board"

interface ProjectDetailProps {
  projectId: string
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter()
  const { user } = useAuth()
  const {
    project,
    loading,
    error,
    archiveProject,
    toggleFavorite,
    refreshProject,
  } = useProject(projectId)

  const handleArchive = async () => {
    if (!project) return
    const isArchived = project.status === "archived"
    if (
      !confirm(
        `Are you sure you want to ${isArchived ? "restore" : "archive"} this project?`
      )
    ) {
      return
    }
    try {
      await archiveProject(!isArchived)
      await refreshProject()
    } catch (err) {
      console.error("Failed to archive project:", err)
    }
  }

  const handleFavorite = async () => {
    try {
      await toggleFavorite()
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
    }
  }

  if (loading) {
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
        <Button
          variant="outline"
          onClick={() => router.push("/projects")}
          className="mt-4"
        >
          Back to Projects
        </Button>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Project not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/projects")}
          className="mt-4"
        >
          Back to Projects
        </Button>
      </div>
    )
  }

  const isArchived = project.status === "archived"
  const isFavorite = false // TODO: Get from project data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {isArchived && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Archive className="h-3 w-3" />
                Archived
              </Badge>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-2">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className={`h-5 w-5 ${
                isFavorite ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
              }`}
            />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleArchive}>
            <Archive className={`h-5 w-5 ${isArchived ? "text-yellow-500" : "text-muted-foreground"}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.issueCount || 0}</div>
          </CardContent>
        </Card>
        {/* TODO: Add more statistics when issue data is available */}
      </div>

      <Tabs defaultValue="board" className="space-y-4">
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="space-y-4">
          <KanbanBoard projectId={projectId} />
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <IssuesList projectId={projectId} teamId={project.teamId} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Manage project information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings will be implemented next</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

