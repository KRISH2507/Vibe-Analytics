import { pool } from "../db";

export async function incrementUsage(userId: string) {
  await pool.query(
    "UPDATE users SET queries_used = queries_used + 1 WHERE id = $1",
    [userId]
  );
}
