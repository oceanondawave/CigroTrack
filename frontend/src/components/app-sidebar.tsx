"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Settings, ChevronDown, Plus, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTeams } from "@/features/teams/hooks/use-teams"
import { CreateTeamDialog } from "@/features/teams/components/create-team-dialog"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Issues", href: "/issues", icon: CheckSquare },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { teams, loading } = useTeams()
  const currentTeam = teams[0]

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 backdrop-blur-md bg-popover/95 border-r border-border/60">
      <div className="flex h-full flex-col">
        {/* Logo & Team Switcher */}
        <div className="flex h-14 items-center px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between px-2 font-semibold hover:bg-accent/50" disabled={loading || !currentTeam}>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-primary/10 backdrop-blur-sm flex items-center justify-center text-foreground text-xs font-bold">
                    {currentTeam?.name?.[0] || "T"}
                  </div>
                  <span className="text-sm">{currentTeam?.name || "No Team"}</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Teams</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              {loading ? (
                <DropdownMenuItem disabled>Loading teams...</DropdownMenuItem>
              ) : teams.length === 0 ? (
                <DropdownMenuItem disabled>No teams</DropdownMenuItem>
              ) : (
                teams.map((team) => (
                  <DropdownMenuItem key={team.id} className="hover:bg-accent/50" asChild>
                    <Link href={`/teams/${team.id}`}>
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-primary/10 backdrop-blur-sm flex items-center justify-center text-xs font-bold">
                          {team.name[0]}
                        </div>
                        <span>{team.name}</span>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator className="bg-border" />
              <CreateTeamDialog />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all",
                    isActive && "bg-accent/50 backdrop-blur-sm font-medium shadow-sm",
                    !isActive && "hover:bg-accent/50",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
            All systems operational
          </div>
        </div>
      </div>
    </aside>
  )
}
