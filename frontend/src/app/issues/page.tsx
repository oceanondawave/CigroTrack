"use client"

import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckSquare, Plus, FolderKanban } from "lucide-react"
import { useProjects } from "@/features/projects/hooks/use-projects"
import { Loader2 } from "lucide-react"

// Note: Issues are project-specific. This page shows a list of projects to select from.
// To view issues, select a project and use the project detail page.

export default function IssuesPage() {
  const { projects, loading: projectsLoading } = useProjects()

  return (
    <ProtectedRoute>
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


        {/* Project Selection */}
        <Card>
          <CardContent className="pt-6">
            {projectsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No projects found</p>
                <p className="text-sm text-muted-foreground">Create a project to start tracking issues</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.filter(p => p.status === 'active').map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FolderKanban className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-medium">{project.name}</h3>
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckSquare className="h-4 w-4" />
                            <span>{project.issueCount || 0} issues</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </AppLayout>
    </ProtectedRoute>
  )
}
