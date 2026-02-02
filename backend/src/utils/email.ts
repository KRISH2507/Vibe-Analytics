import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const isEmailConfigured = process.env.SMTP_USER && 
  process.env.SMTP_PASS && 
  process.env.SMTP_HOST;

export async function sendOTPEmail(email: string, otp: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📧 OTP for ${email}: ${otp}`);
  console.log(`${"=".repeat(60)}\n`);

  if (!isEmailConfigured) {
    console.log('⚠️  SMTP not configured - OTP displayed in console only');
    return {
      success: false,
      error: "Email not configured - check console for OTP"
    };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'Vibe Analytics <noreply@vibeanalytics.com>',
      to: email,
      subject: "Your Vibe Analytics Verification Code",
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
      text: `Your Vibe Analytics verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
