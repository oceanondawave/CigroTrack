import Link from "next/link"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockProjects } from "@/lib/mock-data"
import { CreateProjectDialog } from "@/components/dialogs/create-project-dialog"
import { Star, CheckSquare } from "lucide-react"

export default function ProjectsPage() {
  const favorites = mockProjects.filter((p) => p.favorite)
  const others = mockProjects.filter((p) => !p.favorite)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-2">Organize and track your work across projects</p>
          </div>
          <CreateProjectDialog />
        </div>

        {favorites.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <h2 className="text-xl font-semibold">Favorites</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favorites.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Projects</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {others.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function ProjectCard({ project }: { project: (typeof mockProjects)[0] }) {
  return (
    <Card className="hover:border-primary transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {project.name}
              {project.favorite && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <CheckSquare className="h-3 w-3" />
              {project.issueCount} issues
            </CardDescription>
          </div>
          <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href={`/projects/${project.id}`}>
          <Button variant="outline" className="w-full bg-transparent">
            View Project
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
