/**
 * Authentication Middleware
 * Verifies JWT tokens from requests
 */

import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabase";
import type { User } from "../types";

export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
}

/**
 * Get token from request (from cookie or Authorization header)
 */
function getTokenFromRequest(req: Request): string | null {
  // First, try to get from cookie
  const cookieToken = req.cookies?.auth_token;
  if (cookieToken) {
    // Debug: Log cookie found (remove in production)
    if (process.env.NODE_ENV !== "production") {
      console.log(
        "🍪 Cookie found in request:",
        cookieToken.substring(0, 20) + "..."
      );
    }
    return cookieToken;
  }

  // Fallback to Authorization header
  const authHeader = req.headers.authorization;
  const headerToken = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
  if (headerToken && process.env.NODE_ENV !== "production") {
    console.log("🔑 Token found in Authorization header");
  }
  return headerToken || null;
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: "No token provided", code: "NO_TOKEN" },
      });
      return;
    }

    // Verify token with Supabase
    const {
      data: { user: authUser },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !authUser) {
      res.status(401).json({
        success: false,
        error: { message: "Invalid or expired token", code: "INVALID_TOKEN" },
      });
      return;
    }

    // Get user from public.users
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .is("deleted_at", null)
      .single();

    if (userError || !userData) {
      res.status(401).json({
        success: false,
        error: { message: "User not found", code: "USER_NOT_FOUND" },
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar || undefined,
      authProvider: userData.auth_provider,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
      deletedAt: userData.deleted_at || undefined,
    };
    req.userId = userData.id;

    next();
  } catch (error) {
    // Safely extract error message to avoid circular references
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Auth middleware error:", errorMessage);
    res.status(500).json({
      success: false,
      error: { message: "Internal server error", code: "INTERNAL_ERROR" },
    });
  }
}

/**
 * Optional authentication - attach user if token is present but don't require it
 */
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = getTokenFromRequest(req);

    if (token) {
      const {
        data: { user: authUser },
      } = await supabaseAdmin.auth.getUser(token);

      if (authUser) {
        const { data: userData } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .is("deleted_at", null)
          .single();

        if (userData) {
          req.user = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar || undefined,
            authProvider: userData.auth_provider,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
            deletedAt: userData.deleted_at || undefined,
          };
          req.userId = userData.id;
        }
      }
    }

    next();
  } catch (error) {
    // If optional auth fails, just continue without user
    next();
  }
}
