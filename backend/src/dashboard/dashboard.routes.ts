import { Router } from "express";
import { dashboardSummary } from "./dashboard.controller";
import { requireAuth } from "../middlewares/requireAuth";
import { enforceLimit } from "../middlewares/enforceLimit";
import { trackUsage } from "../middlewares/trackUsage";

const router = Router();

router.get(
  "/summary",
  requireAuth,
  trackUsage as any,   
  dashboardSummary
);

export default router;
