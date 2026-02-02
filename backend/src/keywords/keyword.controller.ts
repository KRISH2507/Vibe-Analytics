import { Request, Response } from "express";
import { addKeywordWithLimit } from "./keyword.service";
import { removeKeyword } from "../models/keyword.model";

export async function createKeyword(
  req: Request & { user?: any },
  res: Response
) {
  try {
    const keyword = req.body.keyword;
    const result = await addKeywordWithLimit(req.user, keyword);
    res.json(result);
  } catch (err: any) {
    if (err.message === "KEYWORD_LIMIT_EXCEEDED") {
      return res.status(403).json({
        message: "Upgrade to Pro to track more keywords",
        code: "UPGRADE_REQUIRED",
      });
    }
    res.status(500).json({ message: "Failed to add keyword" });
  }
}

export async function deleteKeyword(
  req: Request & { user?: any },
  res: Response
) {
  try {
    const { id } = req.params;
    await removeKeyword(req.user.id, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete keyword" });
  }
}
