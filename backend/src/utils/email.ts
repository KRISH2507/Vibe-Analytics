import emailjs from 'emailjs-com';

// Initialize EmailJS
const isEmailConfigured = process.env.EMAILJS_SERVICE_ID && 
  process.env.EMAILJS_TEMPLATE_ID && 
  process.env.EMAILJS_PUBLIC_KEY;

if (isEmailConfigured) {
  emailjs.init(process.env.EMAILJS_PUBLIC_KEY!);
}

export async function sendOTPEmail(email: string, otp: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📧 OTP for ${email}: ${otp}`);
  console.log(`${"=".repeat(60)}\n`);

  if (!isEmailConfigured) {
    console.log('⚠️  EmailJS not configured - OTP displayed in console only');
    return {
      success: false,
      error: "Email not configured - check console for OTP"
    };
  }

  try {
    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID!,
      process.env.EMAILJS_TEMPLATE_ID!,
      {
        to_email: email,
        otp_code: otp,
        user_email: email,
      }
    );

    console.log("✅ Email sent successfully:", result.status);
    return { success: true, messageId: result.status };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
