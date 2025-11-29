"use client"

import { cn } from "@/lib/utils"

import { Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationsDropdown } from "@/features/notifications/components/notifications-dropdown"
import { useAuthContext } from "@/features/auth/contexts/auth-context"

export function AppHeader() {
  const { user, logout } = useAuthContext()

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-popover/95 border-b border-border/60 shadow-sm">
      <div className="flex h-14 items-center gap-4 px-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search issues, projects..."
              className="pl-8 bg-accent/50 backdrop-blur-sm border-border focus:bg-accent transition-all"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationsDropdown />

          {/* Settings */}
          <Button variant="ghost" size="icon" className="hover:bg-accent/50">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-primary/10 backdrop-blur-sm">
                    {user?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="hover:bg-accent/50">Profile</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent/50">Settings</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-accent/50">Switch Team</DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                className="text-destructive hover:bg-accent/50"
                onClick={() => logout()}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
