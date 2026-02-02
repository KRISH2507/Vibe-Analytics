import { Request, Response } from "express";
import { getDashboardSummary } from "./dashboard.service";

export async function dashboardSummary(
  req: Request & { user?: any },
  res: Response
) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await getDashboardSummary(user.id);
    res.json(data);
  } catch (err: any) {
    if (err.message === "LIMIT_REACHED") {
      return res.status(403).json({
        message: "Free plan limit reached. Upgrade to Pro.",
        code: "LIMIT_REACHED",
      });
    }

    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
