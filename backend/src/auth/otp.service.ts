import { query } from "../db";
import { sendOTPEmail } from "../utils/email";

export async function createOtp(email: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await query(
    `INSERT INTO email_otps (email, code, expires_at)
     VALUES ($1, $2, $3)`,
    [email, code, expiresAt]
  );

  // Send OTP via email
  await sendOTPEmail(email, code);

  return code;
}

export async function verifyOtp(email: string, code: string) {
  const rows = await query(
    `SELECT * FROM email_otps
     WHERE email = $1 AND code = $2 AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [email, code]
  );

  return rows.length > 0;
}
