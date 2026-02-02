import { Router } from "express";
import passport from "passport";
import { generateSignupOtp, generateLoginOtp, verifyEmailOtp, getMe } from "./auth.controller";
import { createSession } from "./session.service";

const router = Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  async (req, res) => {
    try {
      const user = req.user as any;

      console.log("Google OAuth callback - User object:", user);

      if (!user) {
        console.error("No user object from Google OAuth");
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      if (!user.id) {
        console.error("User object missing id field:", user);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=missing_user_id`);
      }

      if (!user.is_verified) {
        console.error("User not verified:", user);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=user_not_verified`);
      }

      const token = await createSession(user.id);

      console.log("Session created successfully for user:", user.email);

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error("Error in Google callback:", error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=session_creation_failed`);
    }
  }
);

router.post("/signup-otp", generateSignupOtp);
router.post("/login-otp", generateLoginOtp);
router.post("/verify-otp", verifyEmailOtp);
router.get("/me", getMe);

export default router;
