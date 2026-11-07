import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Sends mail via SMTP when configured. Without SMTP, development logs to the
 * console so the OTP flow is testable; production fails, so codes never reach
 * the logs.
 */
const transporter =
  env.mail.host && env.mail.user
    ? nodemailer.createTransport({
        host: env.mail.host,
        port: env.mail.port,
        secure: env.mail.port === 465,
        auth: { user: env.mail.user, pass: env.mail.pass },
      })
    : null;

export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  if (!transporter) {
    if (env.isProd) throw new Error('SMTP is not configured');
    console.log(`[mail:dev] to=${to} subject="${subject}"\n${text}`);
    return;
  }
  await transporter.sendMail({ from: env.mail.from, to, subject, text });
}
