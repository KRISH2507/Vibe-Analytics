import emailjs from "@emailjs/browser";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// 📧 Send OTP using ONE template (MATCHES EmailJS TEMPLATE)
async function sendOTPEmail(email: string, otp: string) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      email: email,            // matches {{email}}
      passcode: String(otp),   // matches {{passcode}}
      time: "15 minutes",      // matches {{time}}
    },
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
}

// ================= AUTH =================

export async function generateOTP(email: string, name?: string) {
  const res = await fetch(`${API_BASE}/auth/signup-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });

  const data = await res.json();
  if (!data.success) return data;

  // 📧 Send OTP (signup)
  await sendOTPEmail(email, data.otp);

  return data;
}

export async function generateLoginOTP(email: string) {
  const res = await fetch(`${API_BASE}/auth/login-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!data.success) return data;

  // 📧 Send OTP (login)
  await sendOTPEmail(email, data.otp);

  return data;
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
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch user: ${res.status}`);
  }

  return res.json();
}
