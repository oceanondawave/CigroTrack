/**
 * Team Members Component
 * FR-014: View team members list
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MoreVertical,
  UserMinus,
  Shield,
  Crown,
  X,
} from "lucide-react";
import { useTeam } from "../hooks/use-team";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  canKickMember,
  canChangeRole,
  canLeaveTeam,
} from "@/lib/utils/permissions";
import { InviteMemberDialog } from "./invite-member-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TeamMembersProps {
  teamId: string;
}

export function TeamMembers({ teamId }: TeamMembersProps) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    team,
    members,
    invites,
    loading,
    error,
    kickMember,
    leaveTeam,
    changeMemberRole,
    resendInvite,
    revokeInvite,
    refreshMembers,
    refreshInvites,
  } = useTeam(teamId);

  const [kickLoading, setKickLoading] = useState<string | null>(null);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [roleChangeLoading, setRoleChangeLoading] = useState<string | null>(
    null
  );
  const [revokeLoading, setRevokeLoading] = useState<string | null>(null);

  const currentUserMember = members.find((m) => m.user.id === user?.id);
  const currentUserRole = currentUserMember?.role;

  const handleKickMember = async (memberId: string, memberName: string) => {
    if (
      !confirm(`Are you sure you want to remove ${memberName} from the team?`)
    ) {
      return;
    }

    setKickLoading(memberId);
    try {
      await kickMember(memberId);
      await refreshMembers();
    } catch (err) {
      console.error("Failed to kick member:", err);
    } finally {
      setKickLoading(null);
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm("Are you sure you want to leave this team?")) {
      return;
    }

    setLeaveLoading(true);
    try {
      await leaveTeam();
      // Navigate back to teams list after leaving
      router.push("/teams");
    } catch (err) {
      console.error("Failed to leave team:", err);
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleChangeRole = async (
    memberId: string,
    newRole: "OWNER" | "ADMIN" | "MEMBER"
  ) => {
    setRoleChangeLoading(memberId);
    try {
      await changeMemberRole(memberId, newRole);
      await refreshMembers();
    } catch (err) {
      console.error("Failed to change role:", err);
    } finally {
      setRoleChangeLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="h-3 w-3" />;
      case "ADMIN":
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "ADMIN":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            {currentUserRole &&
              (currentUserRole === "OWNER" || currentUserRole === "ADMIN") && (
                <InviteMemberDialog
                  teamId={teamId}
                  onSuccess={() => {
                    refreshMembers();
                    refreshInvites();
                  }}
                />
              )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.map((member) => {
            const canKick =
              currentUserRole &&
              canKickMember(currentUserRole, member.role) &&
              member.role !== "OWNER"; // Can't remove owner
            const canChange = currentUserRole && canChangeRole(currentUserRole);
            const isCurrentUser = member.user.id === user?.id;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.avatar} />
                    <AvatarFallback>
                      {member.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.user.name}</p>
                      {isCurrentUser && (
                        <span className="text-xs text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleBadgeVariant(member.role)}>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </div>
                  </Badge>
                  {(canKick ||
                    canChange ||
                    (isCurrentUser &&
                      currentUserRole &&
                      canLeaveTeam(currentUserRole)) ||
                    (isCurrentUser && currentUserRole === "OWNER")) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isCurrentUser && currentUserRole === "OWNER" && (
                          <>
                            <DropdownMenuItem
                              disabled
                              className="text-muted-foreground cursor-default"
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              <div className="text-left">
                                <div className="font-medium">
                                  You are the owner
                                </div>
                                <div className="text-xs mt-0.5">
                                  Owners cannot leave the team. Transfer
                                  ownership to another member or delete the team
                                  instead.
                                </div>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {canChange && member.role !== "OWNER" && (
                          <>
                            {member.role !== "ADMIN" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(member.id, "ADMIN")
                                }
                                disabled={roleChangeLoading === member.id}
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Promote to Admin
                              </DropdownMenuItem>
                            )}
                            {member.role !== "MEMBER" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleChangeRole(member.id, "MEMBER")
                                }
                                disabled={roleChangeLoading === member.id}
                              >
                                Demote to Member
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        {canChange &&
                          currentUserRole === "OWNER" &&
                          !isCurrentUser &&
                          member.role !== "OWNER" && (
                            <DropdownMenuItem
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to transfer ownership to ${member.user.name}? You will become an ADMIN.`
                                  )
                                ) {
                                  handleChangeRole(member.id, "OWNER");
                                }
                              }}
                              disabled={roleChangeLoading === member.id}
                            >
                              <Crown className="mr-2 h-4 w-4" />
                              Transfer Ownership
                            </DropdownMenuItem>
                          )}
                        {canKick && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleKickMember(member.id, member.user.name)
                            }
                            disabled={kickLoading === member.id}
                            className="text-destructive"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            {kickLoading === member.id
                              ? "Removing..."
                              : "Remove"}
                          </DropdownMenuItem>
                        )}
                        {isCurrentUser &&
                          currentUserRole &&
                          canLeaveTeam(currentUserRole) && (
                            <DropdownMenuItem
                              onClick={handleLeaveTeam}
                              disabled={leaveLoading}
                              className="text-destructive"
                            >
                              {leaveLoading ? "Leaving..." : "Leave Team"}
                            </DropdownMenuItem>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              {invites.filter((i) => i.status === "pending").length} pending
              invite
              {invites.filter((i) => i.status === "pending").length !== 1
                ? "s"
                : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {invites
              .filter((invite) => invite.status === "pending")
              .map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{invite.email}</p>
                    <p className="text-sm text-muted-foreground">
                      Invited as {invite.role} • Expires{" "}
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await resendInvite(invite.id);
                          await refreshInvites();
                        } catch (err) {
                          console.error("Failed to resend invite:", err);
                        }
                      }}
                    >
                      Resend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (
                          !confirm(
                            `Are you sure you want to withdraw the invitation to ${invite.email}?`
                          )
                        ) {
                          return;
                        }
                        setRevokeLoading(invite.id);
                        try {
                          await revokeInvite(invite.id);
                          await refreshInvites();
                        } catch (err) {
                          console.error("Failed to revoke invite:", err);
                        } finally {
                          setRevokeLoading(null);
                        }
                      }}
                      disabled={revokeLoading === invite.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {revokeLoading === invite.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="mr-1 h-4 w-4" />
                          Withdraw
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
