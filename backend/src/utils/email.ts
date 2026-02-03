import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const isEmailConfigured = process.env.RESEND_API_KEY && process.env.FROM_EMAIL;

if (isEmailConfigured) {
  console.log('✅ Resend email service initialized');
} else {
  console.warn('⚠️ Resend not configured - missing API key or FROM_EMAIL');
}

export async function sendOTPEmail(email: string, otp: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📧 OTP for ${email}: ${otp}`);
  console.log(`${"=".repeat(60)}\n`);

  if (!isEmailConfigured) {
    console.log('⚠️  Email not configured - OTP displayed in console only');
    return {
      success: false,
      error: "Email not configured - check console for OTP"
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Vibe Analytics <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Vibe Analytics Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your Email</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up with Vibe Analytics! To complete your registration, please use the verification code below:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you didn't request this code, please ignore this email.</p>
              
              <div class="footer">
                <p>© 2026 Vibe Analytics. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("❌ Error sending email:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Email sent successfully:", data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return { success: false, error: error?.message || String(error) };
  }
}
