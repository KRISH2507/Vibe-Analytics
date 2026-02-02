import { Router } from "express";
import { createKeyword, deleteKeyword } from "./keyword.controller";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.post("/", requireAuth, createKeyword);
router.delete("/:id", requireAuth, deleteKeyword);

export default router;
