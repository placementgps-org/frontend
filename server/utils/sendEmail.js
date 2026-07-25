import nodemailer from 'nodemailer';

let pooledTransporter = null;

/**
 * Creates or retrieves a pooled Nodemailer transporter.
 * Reusing connections via pooling drastically speeds up SMTP delivery.
 */
const getTransporter = () => {
  if (pooledTransporter) return pooledTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('Email OTP service is not configured. Missing SMTP credentials.');
  }

  pooledTransporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: port === '465', // SSL connection
    pool: true,             // Enable connection pooling
    maxConnections: 5,     // Limit open SMTP connections
    maxMessages: 100,       // Reuse connection for up to 100 messages
    rateDelta: 1000,
    rateLimit: 5,          // Max 5 messages per second
    auth: { user, pass },
  });

  return pooledTransporter;
};

/**
 * Send an OTP via Email.
 * Utilizes Nodemailer connection pooling to optimize latency.
 */
const sendEmail = async ({ to, subject, otp }) => {
  const fromEmail = process.env.EMAIL_FROM || process.env.FROM_EMAIL || 'noreply@placementgps.ai';

  // Conditional debug logging of OTP for developers
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_OTP === 'true') {
    console.log(`[sendEmail] [DEBUG OTP] To: ${to} | OTP Code: ${otp}`);
  }

  const transporter = getTransporter();

  const htmlContent = `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0B0F19; border-radius: 16px; overflow: hidden; border: 1px solid rgba(47,128,255,0.25); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); padding: 36px 24px; text-align: center; border-bottom: 1px solid rgba(47,128,255,0.15);">
        <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 24px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">Placement<span style="color: #2F80FF;">GPS</span></span>
        </div>
        <p style="color: #94A3B8; font-size: 13px; margin: 0; font-weight: 500;">Your Career Compass in the Age of AI</p>
      </div>

      <!-- Content Body -->
      <div style="padding: 40px 32px; text-align: center;">
        <h2 style="color: #FFFFFF; font-size: 20px; font-weight: 700; margin: 0 0 16px;">Verify Your Identity</h2>
        <p style="color: #94A3B8; font-size: 14px; line-height: 1.6; margin: 0 0 32px;">Use the verification code below to secure your PlacementGPS account. This code is valid for <strong>10 minutes</strong>.</p>
        
        <!-- OTP Box -->
        <div style="background: rgba(47,128,255,0.06); border: 1px solid rgba(47,128,255,0.25); border-radius: 12px; padding: 24px; display: inline-block; min-width: 200px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #4FA3FF; font-family: monospace;">${otp}</span>
        </div>
        
        <!-- Warning Note -->
        <p style="color: #EF4444; font-size: 12px; margin: 32px 0 0; font-weight: 500;">⚠️ Security Notice: Do NOT share this OTP with anyone, including PlacementGPS staff.</p>
      </div>

      <!-- Footer / Support -->
      <div style="background: #0F172A; border-top: 1px solid rgba(255,255,255,0.04); padding: 24px 32px; text-align: center;">
        <p style="color: #64748B; font-size: 12px; line-height: 1.5; margin: 0 0 16px;">
          If you did not request this verification, you can safely ignore this email. Need help? Contact our support team at <a href="mailto:support@placementgps.ai" style="color: #2F80FF; text-decoration: none;">support@placementgps.ai</a>.
        </p>
        <p style="color: #475569; font-size: 11px; margin: 0;">&copy; 2026 Placement GPS. All rights reserved.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Placement GPS" <${fromEmail}>`,
    to,
    subject,
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
  return { success: true };
};

export default sendEmail;
export { getTransporter };
