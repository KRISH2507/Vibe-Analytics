import { query } from "../db";
import { randomUUID } from "crypto";

export async function createSession(userId: string) {
  const refreshToken = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    `INSERT INTO sessions (user_id, refresh_token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, refreshToken, expiresAt]
  );

  return refreshToken;
}
