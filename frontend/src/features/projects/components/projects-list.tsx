/**
 * Projects List Component
 * FR-021: View all projects, favorites first, then by creation date descending
 */

"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, FolderKanban } from "lucide-react"
import { useProjects } from "../hooks/use-projects"
import { CreateProjectDialog } from "./create-project-dialog"
import { ProjectCard } from "./project-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectsListProps {
  teamId?: string
}

export function ProjectsList({ teamId }: ProjectsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { projects, loading, error, toggleFavorite, refreshProjects } = useProjects(teamId)
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null)

  const activeTab = searchParams.get("status") || "active"
  
  const handleProjectCreated = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleFavoriteToggle = async (projectId: string) => {
    setFavoriteLoading(projectId)
    try {
      await toggleFavorite(projectId)
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
    } finally {
      setFavoriteLoading(null)
    }
  }

  // Separate projects by status
  // TODO: Filter favorites when favorite status is available in Project type
  const activeProjects = projects.filter((p) => p.status === "active")
  const archivedProjects = projects.filter((p) => p.status === "archived")
  const favoriteProjects: typeof projects = [] // Empty for now until favorite is implemented

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
      </div>
    )
  }

  const displayProjects =
    activeTab === "archived" ? archivedProjects : activeTab === "favorites" ? favoriteProjects : activeProjects

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track issues</p>
        </div>
        <CreateProjectDialog teamId={teamId} onSuccess={handleProjectCreated} />
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites {favoriteProjects.length > 0 && `(${favoriteProjects.length})`}
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived {archivedProjects.length > 0 && `(${archivedProjects.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeProjects.length === 0 && favoriteProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first project to start organizing and tracking issues.
                </p>
                <CreateProjectDialog teamId={teamId} onSuccess={handleProjectCreated} />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoriteLoading={favoriteLoading}
                />
              ))}
              {activeProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoriteLoading={favoriteLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          {favoriteProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  No favorite projects yet. Star a project to add it here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoriteLoading={favoriteLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          {archivedProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  No archived projects.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onFavoriteToggle={handleFavoriteToggle}
                  favoriteLoading={favoriteLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

