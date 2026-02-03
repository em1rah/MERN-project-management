/**
 * Sends the password reset code to the user's email.
 * If SMTP is not configured, logs the code to console (for development).
 */
async function sendResetCodeEmail(email, code) {
  const subject = 'Password reset code - Trainee Project Management';
  const html = `
    <p>You requested a password reset.</p>
    <p>Your reset code is: <strong>${code}</strong></p>
    <p>This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
  `;
  const text = `Your password reset code is: ${code}. It expires in 15 minutes.`;

  const hasSmtp =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (hasSmtp) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject,
        text,
        html,
      });
      return { sent: true };
    } catch (err) {
      console.error('Send reset email error:', err.message);
      return { sent: false, error: err.message };
    }
  }

  // Development: log code so you can test without SMTP
  console.log(`[Password reset] Email: ${email} | Code: ${code}`);
  return { sent: true };
}

module.exports = { sendResetCodeEmail };
