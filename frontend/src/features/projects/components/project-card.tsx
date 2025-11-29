/**
 * Project Card Component
 * Displays project information in a card format
 */

"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Archive } from "lucide-react"
import type { Project } from "@/types"

interface ProjectCardProps {
  project: Project
  onFavoriteToggle?: (projectId: string) => void
  favoriteLoading?: string | null
}

export function ProjectCard({
  project,
  onFavoriteToggle,
  favoriteLoading,
}: ProjectCardProps) {
  const isFavorite = false // TODO: Get from project data when available
  const isArchived = project.status === "archived"

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full relative">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">{project.name}</CardTitle>
                {isArchived && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Archive className="h-3 w-3" />
                    Archived
                  </Badge>
                )}
              </div>
              {project.description && (
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              )}
            </div>
            {onFavoriteToggle && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onFavoriteToggle(project.id)
                }}
                disabled={favoriteLoading === project.id}
              >
                <Star
                  className={`h-4 w-4 ${
                    isFavorite
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {project.issueCount || 0} issue{(project.issueCount || 0) !== 1 ? "s" : ""}
            </span>
            <div className="flex flex-col items-end gap-1">
              <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              {project.team?.name && (
                <span className="text-xs">Team: {project.team.name}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

