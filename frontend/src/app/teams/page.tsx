import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockTeams } from "@/lib/mock-data"
import { CreateTeamDialog } from "@/components/dialogs/create-team-dialog"
import { Users, Settings } from "lucide-react"
import Link from "next/link"

export default function TeamsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
            <p className="text-muted-foreground mt-2">Manage your teams and collaborate with others</p>
          </div>
          <CreateTeamDialog />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockTeams.map((team) => (
            <Card key={team.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <CardDescription>{team.members} members</CardDescription>
                    </div>
                  </div>
                  <Badge variant={team.role === "admin" ? "default" : "secondary"}>{team.role}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/teams/${team.id}`}>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Team
                  </Button>
                </Link>
                {team.role === "admin" && (
                  <Link href={`/teams/${team.id}/settings`}>
                    <Button variant="ghost" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
