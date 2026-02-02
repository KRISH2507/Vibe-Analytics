import { Request, Response } from "express";
import { pool } from "../db";

export const healthCheck = async (_req: Request, res: Response) => {
  try {
    // Test database connection
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "OK",
      service: "Vibe Analytics Backend",
      database: {
        status: "connected",
        type: "PostgreSQL (NeonDB)"
      },
      timestamp: new Date().toISOString()
    });
  } catch (dbError) {
    console.error("Database connection check failed:", dbError);
    res.status(503).json({
      status: "DEGRADED",
      service: "Vibe Analytics Backend",
      database: {
        status: "disconnected",
        type: "PostgreSQL (NeonDB)",
        error: dbError instanceof Error ? dbError.message : "Unknown database error"
      },
      timestamp: new Date().toISOString()
    });
  }
};
