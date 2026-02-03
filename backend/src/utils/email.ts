export async function sendOTPEmail(email: string, otp: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📧 OTP for ${email}: ${otp}`);
  console.log(`${"=".repeat(60)}\n`);

  // Backend does NOT send email
  // EmailJS handles it from frontend
  return {
    success: true,
    message: "OTP generated (email handled by frontend via EmailJS)"
  };
}
