import "dotenv/config";
import express from "express";
import cors from "cors";
import passport from "passport";

import healthRoute from "./routes/health.route";
import authRoutes from "./auth/auth.routes";
import { createUser } from "./models/user.model";
import { createOtp } from "./auth/otp.service";
import dashboardRoutes from "./routes/dashboard.route";
import keywordRoutes from "./keywords/keyword.routes";
import paymentRoutes from "./payments/payment.routes";
import analysisRoutes from "./routes/analysis.route";
import trendsRoutes from "./routes/trends.route";
import reportsRoutes from "./routes/reports.route";


// initialize passport strategies
import "./auth/google.strategy";

const app = express();
const PORT = process.env.PORT || 5000;

import { NextFunction } from "express";

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8081',
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

/* -------------------- ROUTES -------------------- */
app.use("/api", healthRoute);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/keywords", keywordRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api", analysisRoutes);
app.use("/api/trends", trendsRoutes);
app.use("/api/reports", reportsRoutes);


/* -------------------- DEV-ONLY TEST ROUTES -------------------- */
/* ❗ REMOVE THESE IN PRODUCTION */

app.get("/api/test-user", async (_req, res) => {
  const user = await createUser(
    "test@vibeanalytics.dev",
    "Test User",
    "local"
  );
  res.json(user);
});

app.get("/api/test-otp", async (req, res) => {
  const email = req.query.email as string;

  if (!email) {
    return res.status(400).json({ message: "email query param required" });
  }

  const otp = await createOtp(email);
  res.json({ email, otp });
});

/* -------------------- SERVER -------------------- */
/* -------------------- GLOBAL ERROR HANDLER -------------------- */
app.use((err: any, req: express.Request, res: express.Response, next: NextFunction) => {
  // Handle TokenError (bad oauth code)
  if (err.name === 'TokenError') {
    // console.warn("OAuth TokenError (likely expired/invalid code):", err.message);
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed_refresh`);
  }

  console.error("Unhandled Server Error:", err);
  res.status(500).json({ success: false, error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export default app;
