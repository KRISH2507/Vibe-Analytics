import { query } from "../db";

export async function findUserByEmail(email: string) {
  const rows = await query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return rows[0];
}

export async function markUserVerified(email: string) {
  const rows = await query(
    `UPDATE users
     SET is_verified = true, last_login_at = NOW()
     WHERE email = $1
     RETURNING *`,
    [email]
  );
  return rows[0];
}

export async function createUser(
  email: string,
  name: string | null,
  provider: string
) {
  const rows = await query(
    `INSERT INTO users (email, name, auth_provider)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, name, provider]
  );
  return rows[0];
}
