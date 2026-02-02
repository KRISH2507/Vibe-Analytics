import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findUserByEmail, createUser, markUserVerified } from "../models/user.model";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error("No email from Google"));

        let user = await findUserByEmail(email);

        if (!user) {
          // Create new user via Google OAuth
          user = await createUser(
            email,
            profile.displayName,
            "google"
          );
          // Google users are auto-verified since Google validates the email
          user = await markUserVerified(email);
        } else {
          // Update existing user's last login
          user = await markUserVerified(email);
        }

        console.log("Google OAuth user authenticated:", { email, id: user.id, is_verified: user.is_verified });

        done(null, user);
      } catch (err) {
        console.error("Google OAuth error:", err);
        done(err as Error);
      }
    }
  )
);
