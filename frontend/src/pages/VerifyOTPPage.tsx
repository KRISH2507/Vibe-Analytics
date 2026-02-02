import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyOTP } from "@/api/auth";

export default function VerifyOTPPage() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from query params or localStorage
    const emailParam = searchParams.get("email");
    const type = searchParams.get("type");

    // Check both signup and login email storage
    const storedEmail = type === "login"
      ? localStorage.getItem("loginEmail")
      : localStorage.getItem("signupEmail");

    setEmail(emailParam || storedEmail || "");
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      setError("Email and OTP required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await verifyOTP(email, otp);
      if (result.success) {
        localStorage.setItem("authToken", result.token);
        // Clean up both possible email storage keys
        localStorage.removeItem("signupEmail");
        localStorage.removeItem("loginEmail");
        navigate("/dashboard");
      } else {
        setError(result.error || "Verification failed");
      }
    } catch (err) {
      console.error('Network error during OTP verification:', err);
      setError("Network error during verification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleVerify} className="w-full max-w-md p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Verify OTP</h1>
          <p className="text-muted-foreground">We've sent a 6-digit code to {email}</p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Enter 6-digit code</label>
          <div className="flex gap-2 justify-center">
            {[...Array(6)].map((_, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={otp[i] || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 1) {
                    const newOtp = otp.split('');
                    newOtp[i] = value;
                    setOtp(newOtp.join(''));

                    // Auto-focus next input
                    if (value && i < 5) {
                      const nextInput = document.querySelectorAll('input[type="text"]')[i + 1] as HTMLInputElement;
                      nextInput?.focus();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !otp[i] && i > 0) {
                    const prevInput = document.querySelectorAll('input[type="text"]')[i - 1] as HTMLInputElement;
                    prevInput?.focus();
                  }
                }}
                maxLength={1}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-border bg-background text-foreground placeholder:text-muted-foreground rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            ))}
          </div>
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
}
