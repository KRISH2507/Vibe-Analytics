import { Request, Response, NextFunction } from "express";
import { pool } from "../db";

export async function trackUsage(
  req: Request & { user?: { email: string } },
  _res: Response,
  next: NextFunction
) {
  try {
    if (!req.user?.email) {
      return next();
    }

    await pool.query(
      `
      UPDATE users
      SET queries_used = queries_used + 1
      WHERE email = $1
      `,
      [req.user.email]
    );

    next();
  } catch (error) {
    console.error("Usage tracking failed:", error);
    next(); // ⚠️ never block request
  }
}
