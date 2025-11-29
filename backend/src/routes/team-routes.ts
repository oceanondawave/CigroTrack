/**
 * Team Routes
 * FR-010 to FR-019
 */

import { Router, Response } from "express";
import { teamService } from "../services/teams/team-service";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { asyncHandler } from "../middleware/error-handler";
import { supabaseAdmin } from "../config/supabase";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/teams
 * FR-010: Create Team
 */
router.post(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { name } = req.body;

    if (!name) {
      res
        .status(400)
        .json({
          success: false,
          error: { message: "Team name is required", code: "MISSING_NAME" },
        });
      return;
    }

    try {
      const team = await teamService.createTeam({ name, ownerId: req.userId });

      res.status(201).json({
        success: true,
        data: team,
      });
    } catch (error) {
      console.error("Team creation error in route:", {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: req.userId,
        teamName: req.body.name,
      });
      // Re-throw with more context
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create team";
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).statusCode = 500;
      (enhancedError as any).code = "TEAM_CREATION_FAILED";
      throw enhancedError;
    }
  })
);

/**
 * GET /api/teams
 * FR-011: Get Teams
 */
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    try {
      const teams = await teamService.getTeams(req.userId);
      res.status(200).json({
        success: true,
        data: teams,
      });
    } catch (error) {
      // Safely extract error information to avoid circular references
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Only log primitive values to avoid circular references
      console.error("Error in GET /api/teams -", errorMessage);

      // Return error response directly instead of re-throwing to avoid circular references
      res.status(500).json({
        success: false,
        error: {
          message: errorMessage || "Failed to fetch teams",
          code: "TEAMS_FETCH_ERROR",
        },
      });
      return;
    }
  })
);

/**
 * GET /api/teams/invites
 * Get pending invites for current user
 */
router.get(
  "/invites",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    // Get user email
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("id", req.userId)
      .single();

    if (userError || !userData) {
      res
        .status(404)
        .json({
          success: false,
          error: { message: "User not found", code: "USER_NOT_FOUND" },
        });
      return;
    }

    const invites = await teamService.getUserPendingInvites(userData.email);

    res.status(200).json({
      success: true,
      data: invites,
    });
  })
);

/**
 * POST /api/teams/invites/:id/accept
 * Accept a team invitation
 */
router.post(
  "/invites/:id/accept",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id } = req.params;
    const member = await teamService.acceptInvite(id, req.userId);

    res.status(200).json({
      success: true,
      data: member,
      message: "Invitation accepted successfully",
    });
  })
);

/**
 * POST /api/teams/invites/:id/resend
 * Resend team invitation (extends expiration date)
 */
router.post(
  "/invites/:id/resend",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id } = req.params;
    const invite = await teamService.resendInvite(id, req.userId);

    res.status(200).json({
      success: true,
      data: invite,
      message: "Invitation resent successfully",
    });
  })
);

/**
 * POST /api/teams/invites/:id/decline
 * Decline a team invitation
 */
router.post(
  "/invites/:id/decline",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id } = req.params;
    await teamService.declineInvite(id, req.userId);

    res.status(200).json({
      success: true,
      message: "Invitation declined successfully",
    });
  })
);

/**
 * GET /api/teams/:id
 * FR-012: Get Team by ID
 */
router.get(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const team = await teamService.getTeamById(id);

    if (!team) {
      res
        .status(404)
        .json({
          success: false,
          error: { message: "Team not found", code: "TEAM_NOT_FOUND" },
        });
      return;
    }

    res.status(200).json({
      success: true,
      data: team,
    });
  })
);

/**
 * PUT /api/teams/:id
 * FR-012: Update Team
 */
router.put(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id } = req.params;
    const { name } = req.body;

    const team = await teamService.updateTeam(id, { name }, req.userId);

    res.status(200).json({
      success: true,
      data: team,
    });
  })
);

/**
 * POST /api/teams/:id/invite
 * FR-013: Invite Member
 */
router.post(
  "/:id/invite",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) {
      res
        .status(400)
        .json({
          success: false,
          error: { message: "Email is required", code: "MISSING_EMAIL" },
        });
      return;
    }

    const invite = await teamService.inviteMember({
      teamId: id,
      email,
      role: role || "MEMBER",
      invitedBy: req.userId,
    });

    res.status(201).json({
      success: true,
      data: invite,
    });
  })
);

/**
 * GET /api/teams/:id/invites
 * Get pending team invites
 */
router.get(
  "/:id/invites",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id } = req.params;
    const invites = await teamService.getTeamInvites(id);

    res.status(200).json({
      success: true,
      data: invites,
    });
  })
);

/**
 * DELETE /api/teams/:id/invites/:inviteId
 * Revoke/withdraw team invitation
 * NOTE: Must be placed BEFORE DELETE /:id to ensure correct route matching
 */
router.delete(
  "/:id/invites/:inviteId",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { inviteId } = req.params;
    await teamService.revokeInvite(inviteId, req.userId);

    res.status(200).json({
      success: true,
      message: "Invitation revoked successfully",
    });
  })
);

/**
 * DELETE /api/teams/:id
 * FR-012: Delete Team
 * NOTE: Must be placed AFTER more specific routes like /:id/invites/:inviteId
 */
router.delete(
  "/:id",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id } = req.params;

    await teamService.deleteTeam(id, req.userId);

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  })
);

/**
 * GET /api/teams/:id/members
 * FR-014: Get Team Members
 */
router.get(
  "/:id/members",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const members = await teamService.getMembers(id);

    res.status(200).json({
      success: true,
      data: members,
    });
  })
);

/**
 * PUT /api/teams/:id/members/:userId/role
 * FR-017: Change Member Role
 */
router.put(
  "/:id/members/:userId/role",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id, userId } = req.params;
    const { role } = req.body;

    if (!role || !["OWNER", "ADMIN", "MEMBER"].includes(role)) {
      res
        .status(400)
        .json({
          success: false,
          error: { message: "Valid role is required", code: "INVALID_ROLE" },
        });
      return;
    }

    await teamService.changeMemberRole(
      id,
      userId,
      role as "OWNER" | "ADMIN" | "MEMBER",
      req.userId
    );

    res.status(200).json({
      success: true,
      message: "Role changed successfully",
    });
  })
);

/**
 * DELETE /api/teams/:id/members/:memberId
 * FR-016: Remove Member (kick)
 */
router.delete(
  "/:id/members/:memberId",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id, memberId } = req.params;
    await teamService.removeMember(id, memberId, req.userId);

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  })
);

/**
 * POST /api/teams/:id/leave
 * FR-015: Leave Team
 */
router.post(
  "/:id/leave",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
      return;
    }

    const { id } = req.params;

    // Get member ID from user ID and remove
    const members = await teamService.getMembers(id);
    const member = members.find((m) => m.userId === req.userId);
    if (!member) {
      res
        .status(404)
        .json({
          success: false,
          error: { message: "Member not found", code: "MEMBER_NOT_FOUND" },
        });
      return;
    }
    await teamService.removeMember(id, member.id, req.userId);

    res.status(200).json({
      success: true,
      message: "Left team successfully",
    });
  })
);

/**
 * GET /api/teams/:id/activity
 * FR-019: Get Team Activity
 */
router.get(
  "/:id/activity",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await teamService.getActivity(id, page, limit);
    const totalPages = Math.ceil(result.total / limit);

    res.status(200).json({
      success: true,
      data: {
        data: result.activities,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages,
        },
      },
    });
  })
);

export default router;
