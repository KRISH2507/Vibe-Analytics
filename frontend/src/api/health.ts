const API_BASE = (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api";

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function checkDatabaseConnection() {
  try {
    const healthData = await checkHealth();
    return {
      connected: healthData.database?.status === "connected",
      details: healthData.database,
      overallStatus: healthData.status
    };
  } catch (error) {
    console.error("Failed to check database connection:", error);
    return {
      connected: false,
      details: null,
      overallStatus: "ERROR",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}