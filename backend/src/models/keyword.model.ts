import { pool } from "../db";

export async function getUserKeywords(userId: string) {
  const res = await pool.query(
    "SELECT id, keyword FROM keywords WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return res.rows;
}

export async function addKeyword(userId: string, keyword: string) {
  const res = await pool.query(
    `INSERT INTO keywords (user_id, keyword)
     VALUES ($1, $2)
     RETURNING id, keyword`,
    [userId, keyword]
  );
  return res.rows[0];
}

export async function removeKeyword(userId: string, keywordId: string) {
  await pool.query(
    "DELETE FROM keywords WHERE id = $1 AND user_id = $2",
    [keywordId, userId]
  );
}

export async function countUserKeywords(userId: string) {
  const res = await pool.query(
    "SELECT COUNT(*) FROM keywords WHERE user_id = $1",
    [userId]
  );
  return Number(res.rows[0].count);
}
