/**
 * Notifications List Component
 * FR-090: Full notifications page
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCheck, Bell } from "lucide-react"
import { useNotifications } from "../hooks/use-notifications"
import { NotificationItem } from "./notification-item"

export function NotificationsList() {
  const {
    notifications: allNotifications,
    loading: allLoading,
    error: allError,
    markAllAsRead,
    refreshNotifications: refreshAll,
    loadMore: loadMoreAll,
    hasMore: hasMoreAll,
  } = useNotifications(false)

  const {
    notifications: unreadNotifications,
    loading: unreadLoading,
    error: unreadError,
    refreshNotifications: refreshUnread,
    loadMore: loadMoreUnread,
    hasMore: hasMoreUnread,
  } = useNotifications(true)

  if (allLoading && allNotifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Manage your notifications</p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All
            {allNotifications.length > 0 && (
              <span className="ml-2 text-xs">({allNotifications.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadNotifications.length > 0 && (
              <span className="ml-2 text-xs">({unreadNotifications.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {allError ? (
            <Card>
              <CardContent className="p-4">
                <p className="text-destructive">{allError}</p>
              </CardContent>
            </Card>
          ) : allNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/60">
                    {allNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              {hasMoreAll && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={loadMoreAll} disabled={allLoading}>
                    {allLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadError ? (
            <Card>
              <CardContent className="p-4">
                <p className="text-destructive">{unreadError}</p>
              </CardContent>
            </Card>
          ) : unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No unread notifications</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/60">
                    {unreadNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              {hasMoreUnread && (
                <div className="flex justify-center">
                  <Button variant="outline" onClick={loadMoreUnread} disabled={unreadLoading}>
                    {unreadLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

