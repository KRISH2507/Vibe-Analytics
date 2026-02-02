import { useState } from "react";
import { verifyOTP } from "@/api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function VerifyOtp() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const email = localStorage.getItem("auth_email");

  // 🚨 Safety: user opened page without email
  if (!email) {
    navigate("/login");
    return null;
  }

  async function submit() {
    if (code.length !== 6) {
      toast.error("Enter a valid 6-digit code");
      return;
    }

    try {
      setLoading(true);
      await verifyOTP(email, code);

      toast.success("Email verified 🎉");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="space-y-4 w-80">
        <h1 className="text-xl font-semibold text-center">
          Enter verification code
        </h1>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, ""))
          }
          className="w-full border rounded px-3 py-2 text-center text-lg tracking-widest"
          placeholder="123456"
        />

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>
    </div>
  );
}
