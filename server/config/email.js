const nodemailer = require("nodemailer");

/**
 * Creates a nodemailer transporter from environment config.
 * Supports: Gmail OAuth, generic SMTP, or Ethereal (dev/test).
 */
const createTransporter = () => {
  // Use Ethereal test account if no SMTP config provided (development)
  if (process.env.EMAIL_SERVICE === "ethereal" || !process.env.SMTP_HOST) {
    // Ethereal is auto-configured via sendResetEmail when no env vars exist
    return null;
  }

  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use a Gmail App Password, not your real password
      },
    });
  }

  // Generic SMTP (Mailtrap, SendGrid SMTP, etc.)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Sends the password reset email.
 * Falls back to Ethereal (fake SMTP) if no mail config is set — logs preview URL.
 */
const sendResetEmail = async ({ toEmail, toName, resetURL }) => {
  let transporter = createTransporter();

  // Development fallback: use Ethereal test account
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const fromName    = process.env.EMAIL_FROM_NAME  || "SecureFinX";
  const fromAddress = process.env.EMAIL_FROM       || "no-reply@securefinx.com";

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to: toEmail,
    subject: "Reset your SecureFinX password",
    // Plain text fallback
    text: `Hi ${toName},\n\nYou requested a password reset.\n\nClick this link to reset your password (valid for 1 hour):\n${resetURL}\n\nIf you did not request this, you can safely ignore this email.\n\n— SecureFinX`,
    // HTML email
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#111118;border-radius:16px;border:1px solid #ffffff12;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 36px 24px;border-bottom:1px solid #ffffff10;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:36px;height:36px;background:#00e5a0;border-radius:9px;text-align:center;vertical-align:middle;">
                    <span style="font-size:18px;font-weight:800;color:#000;">S</span>
                  </td>
                  <td style="padding-left:10px;font-size:17px;font-weight:700;color:#f0f0f5;letter-spacing:-0.02em;">
                    SecureFinX
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#f0f0f5;letter-spacing:-0.03em;">
                Reset your password
              </h1>
              <p style="margin:0 0 24px;font-size:14px;color:#7a7a94;line-height:1.6;">
                Hi ${toName}, we received a request to reset the password for your SecureFinX account.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#00e5a0;border-radius:8px;">
                    <a href="${resetURL}"
                       style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#000;text-decoration:none;letter-spacing:0.01em;">
                      Reset password →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;font-size:13px;color:#7a7a94;line-height:1.6;">
                This link expires in <strong style="color:#f0f0f5;">1 hour</strong>. 
                If you didn't request a password reset, you can safely ignore this email — your password won't change.
              </p>

              <!-- Fallback URL -->
              <div style="background:#1a1a24;border-radius:8px;padding:12px 14px;margin-top:20px;word-break:break-all;">
                <p style="margin:0 0 4px;font-size:11px;color:#7a7a94;text-transform:uppercase;letter-spacing:0.08em;">
                  Or copy this link
                </p>
                <a href="${resetURL}" style="font-size:12px;color:#00e5a0;text-decoration:none;">${resetURL}</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 36px;border-top:1px solid #ffffff10;">
              <p style="margin:0;font-size:12px;color:#3a3a54;text-align:center;">
                SecureFinX · This is an automated email, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  };

  const info = await transporter.sendMail(mailOptions);

  // In development with Ethereal, log the preview URL
  if (process.env.NODE_ENV !== "production") {
    const previewURL = nodemailer.getTestMessageUrl(info);
    if (previewURL) {
      console.log("📧 Email preview URL:", previewURL);
    }
  }

  return info;
};

module.exports = { sendResetEmail };
