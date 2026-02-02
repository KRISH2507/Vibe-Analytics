const API_BASE = (import.meta as any).env.VITE_API_URL || "http://localhost:5000/api";

export async function generateOTP(email: string, name?: string) {
  const res = await fetch(`${API_BASE}/auth/signup-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  return res.json();
}

export async function generateLoginOTP(email: string) {
  const res = await fetch(`${API_BASE}/auth/login-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function verifyOTP(email: string, otp: string) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  return res.json();
}

export async function getGoogleAuthURL() {
  return `${API_BASE}/auth/google`;
}

export async function fetchMe() {
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    throw new Error("No auth token found in localStorage");
  }

  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${authToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
