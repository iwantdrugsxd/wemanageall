import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service
 * Handles sending emails via SMTP or console fallback
 */

let transporter = null;

// Initialize transporter if SMTP is configured
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} resetLink - Password reset link
 */
export async function sendPasswordResetEmail(email, resetLink) {
  const subject = 'Reset Your Password';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #000;">Reset Your Password</h2>
      <p>You requested to reset your password. Click the link below to create a new password:</p>
      <p style="margin: 20px 0;">
        <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 8px;">
          Reset Password
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetLink}</p>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        This link will expire in 1 hour. If you didn't request this, please ignore this email.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject,
        html,
      });
      console.log(`✅ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      // Fall through to console log
    }
  }

  // Fallback: log to console
  console.log('\n📧 Password Reset Email (SMTP not configured):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Reset Link: ${resetLink}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  return true;
}

export default {
  sendPasswordResetEmail,
};
