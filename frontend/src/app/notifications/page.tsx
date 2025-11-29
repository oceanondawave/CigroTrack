"use client"

import { useState } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockNotifications } from "@/lib/mock-data"
import { Check, CheckCheck, Bell } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length
  const unreadNotifications = notifications.filter((n) => !n.read)
  const readNotifications = notifications.filter((n) => n.read)

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-2">Stay updated with your team's activity</p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          notification.read ? "border-border bg-muted/30" : "border-primary/50 bg-primary/5"
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.read ? "bg-muted-foreground" : "bg-primary"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unread" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                {unreadNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">All caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {unreadNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-primary/50 bg-primary/5"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
