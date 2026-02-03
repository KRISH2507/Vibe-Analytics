import { Request, Response } from "express";
import { createOtp, verifyOtp } from "./otp.service";
import { findUserByEmail, markUserVerified, createUser } from "../models/user.model";
import { createSession } from "./session.service";
import { sendOTPEmail } from "../utils/email";
import { pool } from "../db";

export async function generateSignupOtp(
  req: Request,
  res: Response
) {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.is_verified) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please login instead."
      });
    }

    // Create or update user (unverified)
    if (!existingUser) {
      await createUser(email, name || null, "local");
    }

    const code = await createOtp(email);

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, code);

    // Log for development debugging
    console.log(`[SIGNUP OTP] Email: ${email}, Code: ${code}`);

    if (emailResult.success) {
      return res.json({
        success: true,
        message: "OTP sent to email",
        otp: code,
      });
    } else {
      // Email failed but OTP is still in database
      return res.json({
        success: true,
        message: "OTP generated (email delivery may have failed - check console)",
        otp: code,
      });
    }
  } catch (error) {
    console.error("Error generating signup OTP:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to generate OTP. Please check server logs for details."
    });
  }
}

export async function generateLoginOtp(
  req: Request,
  res: Response
) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    // Check if user exists and is verified
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email. Please sign up first."
      });
    }

    if (!user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Account not verified. Please complete signup first."
      });
    }

    const code = await createOtp(email);

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, code);

    // Log for development debugging
    console.log(`[LOGIN OTP] Email: ${email}, Code: ${code}`);

    if (emailResult.success) {
      return res.json({
        success: true,
        message: "OTP sent to email",
        otp: code,
      });
    } else {
      // Email failed but OTP is still in database
      return res.json({
        success: true,
        message: "OTP generated (email delivery may have failed - check console)",
        otp: code,
      });
    }
  } catch (error) {
    console.error("Error generating login OTP:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to generate OTP. Please check server logs for details."
    });
  }
}


export async function verifyEmailOtp(
  req: Request,
  res: Response
) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required"
    });
  }

  try {
    const isValid = await verifyOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ success: false, error: "Invalid or expired OTP" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const verifiedUser = await markUserVerified(email);
    const session = await createSession(verifiedUser.id);

    return res.json({
      success: true,
      message: "Email verified",
      user: verifiedUser,
      token: session,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      email,
    });
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please check server logs for details."
    });
  }
}

export async function getMe(
  req: Request,
  res: Response
) {
  // Read Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: "Missing Authorization header"
    });
  }

  // Extract token from "Bearer <token>" format
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      success: false,
      error: "Invalid Authorization header format. Use 'Bearer <token>'"
    });
  }

  const token = parts[1];

  try {
    // Try to find user by session token first (for Google OAuth)
    const sessionResult = await pool.query(
      `SELECT u.id, u.email, u.name, u.auth_provider, u.created_at, u.plan 
       FROM users u
       INNER JOIN sessions s ON s.user_id = u.id
       WHERE s.refresh_token = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (sessionResult.rows.length > 0) {
      const user = sessionResult.rows[0];
      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          auth_provider: user.auth_provider,
          created_at: user.created_at,
          plan: user.plan || "free"
        }
      });
    }

    // Fallback: try to find user by email (for OTP login backwards compatibility)
    const user = await findUserByEmail(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found or session expired"
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        auth_provider: user.auth_provider,
        created_at: user.created_at,
        plan: "free"
      }
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch user"
    });
  }
}
