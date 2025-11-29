export const mockUser = {
  id: "1",
  name: "Alex Johnson",
  email: "alex@example.com",
  avatar: "/diverse-avatars.png",
}

export const mockTeams = [
  { id: "1", name: "Engineering", members: 12, role: "admin" },
  { id: "2", name: "Design", members: 8, role: "member" },
  { id: "3", name: "Marketing", members: 6, role: "member" },
]

export const mockProjects = [
  {
    id: "1",
    name: "Mobile App Redesign",
    teamId: "1",
    favorite: true,
    issueCount: 24,
    status: "active",
  },
  {
    id: "2",
    name: "API v2 Migration",
    teamId: "1",
    favorite: true,
    issueCount: 18,
    status: "active",
  },
  {
    id: "3",
    name: "Marketing Website",
    teamId: "3",
    favorite: false,
    issueCount: 12,
    status: "active",
  },
]

export const mockIssues = [
  {
    id: "1",
    title: "Fix login button alignment",
    status: "In Progress",
    priority: "high",
    assignee: "Alex Johnson",
    dueDate: "2024-12-15",
    labels: ["bug", "ui"],
    projectId: "1",
  },
  {
    id: "2",
    title: "Add dark mode support",
    status: "Backlog",
    priority: "medium",
    assignee: "Sarah Chen",
    dueDate: "2024-12-20",
    labels: ["feature", "ui"],
    projectId: "1",
  },
  {
    id: "3",
    title: "Optimize database queries",
    status: "Done",
    priority: "high",
    assignee: "Mike Rodriguez",
    dueDate: "2024-12-10",
    labels: ["performance"],
    projectId: "2",
  },
]

export const mockNotifications = [
  {
    id: "1",
    title: "Alex assigned you to 'Fix login button alignment'",
    time: "5 min ago",
    read: false,
  },
  {
    id: "2",
    title: "New comment on 'Add dark mode support'",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    title: "Project 'Mobile App Redesign' updated",
    time: "2 hours ago",
    read: true,
  },
]

export const mockTeamMembers = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "admin",
    avatar: "/placeholder.svg?key=8a7pw",
    joinedDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "member",
    avatar: "/placeholder.svg?key=9b8qx",
    joinedDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Mike Rodriguez",
    email: "mike@example.com",
    role: "member",
    avatar: "/placeholder.svg?key=0c9ry",
    joinedDate: "2024-03-10",
  },
  {
    id: "4",
    name: "Emma Davis",
    email: "emma@example.com",
    role: "viewer",
    avatar: "/placeholder.svg?key=1d0sz",
    joinedDate: "2024-04-05",
  },
]

export const mockPendingInvites = [
  {
    id: "1",
    email: "john@example.com",
    role: "member",
    invitedBy: "Alex Johnson",
    invitedDate: "2024-11-28",
  },
  {
    id: "2",
    email: "lisa@example.com",
    role: "viewer",
    invitedBy: "Sarah Chen",
    invitedDate: "2024-11-27",
  },
]

export const mockTeamActivity = [
  {
    id: "1",
    user: "Alex Johnson",
    action: "created project",
    target: "Mobile App Redesign",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    user: "Sarah Chen",
    action: "closed issue",
    target: "Fix login button alignment",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    user: "Mike Rodriguez",
    action: "invited",
    target: "john@example.com",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    user: "Emma Davis",
    action: "commented on",
    target: "Add dark mode support",
    timestamp: "2 days ago",
  },
  {
    id: "5",
    user: "Alex Johnson",
    action: "updated team settings",
    target: "Engineering",
    timestamp: "3 days ago",
  },
]

export const mockComments = [
  {
    id: "1",
    issueId: "1",
    author: "Sarah Chen",
    authorAvatar: "/placeholder.svg?key=9b8qx",
    content: "I've started working on this. The alignment issue seems to be caused by the parent container.",
    timestamp: "2 hours ago",
    deleted: false,
  },
  {
    id: "2",
    issueId: "1",
    author: "Alex Johnson",
    authorAvatar: "/placeholder.svg?key=8a7pw",
    content: "Thanks for the update! Let me know if you need any help.",
    timestamp: "1 hour ago",
    deleted: false,
  },
  {
    id: "3",
    issueId: "1",
    author: "Mike Rodriguez",
    authorAvatar: "/placeholder.svg?key=0c9ry",
    content: "This comment was deleted",
    timestamp: "30 min ago",
    deleted: true,
  },
]

export const mockIssueHistory = [
  {
    id: "1",
    user: "Alex Johnson",
    action: "created this issue",
    timestamp: "3 days ago",
  },
  {
    id: "2",
    user: "Alex Johnson",
    action: "assigned to Sarah Chen",
    timestamp: "3 days ago",
  },
  {
    id: "3",
    user: "Sarah Chen",
    action: "changed status from Backlog to In Progress",
    timestamp: "2 days ago",
  },
  {
    id: "4",
    user: "Sarah Chen",
    action: "added label 'ui'",
    timestamp: "2 days ago",
  },
]

export const mockSubtasks = [
  {
    id: "1",
    title: "Update button CSS",
    completed: true,
  },
  {
    id: "2",
    title: "Test on mobile devices",
    completed: false,
  },
  {
    id: "3",
    title: "Update documentation",
    completed: false,
  },
]
