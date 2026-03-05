import nodemailer from "nodemailer";
import { SMTP_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from "../config";

export class EmailService {
    private transporter = SMTP_HOST && SMTP_USER && SMTP_PASS
        ? nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        })
        : null;

    async sendPasswordResetEmail(to: string, resetLink: string) {
        if (!this.transporter) {
            throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.");
        }

        await this.transporter.sendMail({
            from: SMTP_FROM,
            to,
            subject: "Reset your Match Aura password",
            html: `
                <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
                  <h2 style="margin:0 0 12px">Reset your password</h2>
                  <p style="margin:0 0 16px">We received a request to reset your Match Aura password.</p>
                  <p style="margin:0 0 16px">
                    <a href="${resetLink}" style="display:inline-block;background:#f43f5e;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600">
                      Reset password
                    </a>
                  </p>
                  <p style="margin:0 0 8px">This link expires in 1 hour.</p>
                  <p style="margin:0">If you did not request this, you can ignore this email.</p>
                </div>
            `,
            text: `Reset your Match Aura password: ${resetLink} (expires in 1 hour)`,
        });
    }
}
