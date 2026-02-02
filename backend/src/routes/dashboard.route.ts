import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { dashboardSummary } from "../dashboard/dashboard.controller";

const router = Router();

router.get("/summary", requireAuth, dashboardSummary);

export default router;
