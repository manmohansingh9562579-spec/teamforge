import nodemailer from "nodemailer";

type PasswordResetEmail = {
  to: string;
  name: string;
  resetUrl: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS;

  if (!host || !from || !Number.isInteger(port) || port < 1 || port > 65535) {
    return null;
  }

  if (Boolean(user) !== Boolean(pass)) return null;

  return {
    host,
    from,
    port,
    secure: process.env.SMTP_SECURE
      ? process.env.SMTP_SECURE.toLowerCase() === "true"
      : port === 465,
    auth: user && pass ? { user, pass } : undefined,
  };
}

export function isPasswordResetEmailConfigured() {
  return getSmtpConfig() !== null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: PasswordResetEmail) {
  const config = getSmtpConfig();
  if (!config) throw new Error("SMTP is not configured");

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 8_000,
  });

  const safeName = escapeHtml(name || "there");
  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Reset your TeamForge password",
    text: `Hi ${name || "there"},\n\nWe received a request to reset your TeamForge password. Use this link within 30 minutes:\n${resetUrl}\n\nIf you didn't request this, you can ignore this email. Your password will not change.`,
    html: `<!doctype html><html><body style="margin:0;background:#f5f6fa;font-family:Arial,sans-serif;color:#171923"><div style="max-width:560px;margin:32px auto;padding:32px;background:#fff;border:1px solid #e6e8ef;border-radius:16px"><p style="font-size:12px;font-weight:700;letter-spacing:2px;color:#6f68f3">TEAMFORGE</p><h1 style="font-size:24px;margin:20px 0 12px">Reset your password</h1><p>Hi ${safeName},</p><p>We received a request to reset your TeamForge password. This link expires in 30 minutes.</p><p style="margin:28px 0"><a href="${resetUrl}" style="display:inline-block;padding:13px 20px;border-radius:9px;background:#6f68f3;color:#fff;text-decoration:none;font-weight:700">Choose a new password</a></p><p style="font-size:13px;color:#626779">If the button does not work, copy this link into your browser:<br><a href="${resetUrl}" style="color:#5750dc;word-break:break-all">${resetUrl}</a></p><p style="font-size:13px;color:#626779">If you didn't request this, you can ignore this email. Your password will not change.</p></div></body></html>`,
  });
}

export function getAppUrl() {
  const configuredUrl =
    process.env.APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  return configuredUrl.replace(/\/$/, "");
}
