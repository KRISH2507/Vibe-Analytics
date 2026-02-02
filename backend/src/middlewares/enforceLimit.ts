import { Request, Response, NextFunction } from "express";
import { pool } from "../db";

export async function enforceLimit(
  req: Request & { user?: { email: string } },
  res: Response,
  next: NextFunction
) {
  if (!req.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { rows } = await pool.query(
    `
    SELECT plan, queries_used
    FROM users
    WHERE email = $1
    `,
    [req.user.email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ message: "Invalid user" });
  }

  const user = rows[0];

  // 🚫 FREE PLAN LIMIT
  if (user.plan === "free" && user.queries_used >= 50) {
    return res.status(403).json({
      message: "Free plan limit reached. Upgrade to Pro.",
      code: "LIMIT_REACHED",
    });
  }

  next();
}
