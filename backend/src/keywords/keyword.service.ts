import { addKeyword, countUserKeywords } from "../models/keyword.model";

export async function addKeywordWithLimit(user: any, keyword: string) {
  if (user.plan === "free") {
    const count = await countUserKeywords(user.id);
    if (count >= 3) {
      throw new Error("KEYWORD_LIMIT_EXCEEDED");
    }
  }

  return addKeyword(user.id, keyword);
}
