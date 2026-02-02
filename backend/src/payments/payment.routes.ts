import { Router } from "express";
import { createProOrder, verifyPayment } from "./payment.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/create-order", requireAuth, createProOrder);
router.post("/verify", requireAuth, verifyPayment);

export default router;
