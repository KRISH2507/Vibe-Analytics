import { Request, Response, NextFunction } from "express";
import { pool } from "../db";

export async function requireAuth(
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("[requireAuth] No authorization header provided");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.replace("Bearer ", "");
  console.log("[requireAuth] Validating token:", token.substring(0, 8) + "...");

  try {
    // Try to find user by session token first (for Google OAuth)
    const sessionResult = await pool.query(
      `SELECT u.id, u.email, u.plan, u.queries_used, u.name
       FROM users u
       INNER JOIN sessions s ON s.user_id = u.id
       WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (sessionResult.rows.length > 0) {
      req.user = sessionResult.rows[0];
      console.log("[requireAuth] User authenticated via session:", req.user.email);
      return next();
    }

    console.log("[requireAuth] No valid session found, trying email fallback");

    // Fallback: try to find user by email (for OTP login backwards compatibility)
    const userResult = await pool.query(
      "SELECT id, email, plan, queries_used, name FROM users WHERE email = $1",
      [token]
    );

    if (userResult.rows.length === 0) {
      console.log("[requireAuth] Authentication failed: user not found");
      return res.status(401).json({ message: "User not found or session expired" });
    }

    req.user = userResult.rows[0];
    console.log("[requireAuth] User authenticated via email fallback:", req.user.email);
    next();
  } catch (error) {
    console.error("[requireAuth] Database error during authentication:", error);
    console.error("[requireAuth] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      detail: (error as any)?.detail,
    });
    return res.status(500).json({
      message: "Authentication error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
