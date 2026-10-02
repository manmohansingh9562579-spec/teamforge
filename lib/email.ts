type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function publicAppOrigin() {
  const configuredUrl = process.env.APP_URL || process.env.NEXTAUTH_URL;
  if (!configuredUrl) throw new Error("APP_URL is not configured");

  const url = new URL(configuredUrl);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production");
  }
  return url.origin;
}

export function isPasswordResetEmailConfigured() {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return false;
  try {
    publicAppOrigin();
    return true;
  } catch {
    return false;
  }
}

async function sendTransactionalEmail(email: TransactionalEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Email delivery is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, ...email }),
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) throw new Error(`Email delivery failed (${response.status})`);
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

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = new URL("/reset-password", publicAppOrigin());
  resetUrl.searchParams.set("token", token);
  const safeName = escapeHtml(name || "there");
  const link = resetUrl.toString();

  await sendTransactionalEmail({
    to,
    subject: "Reset your TeamForge password",
    text: `Hi ${name || "there"},\n\nUse this link to reset your TeamForge password. It expires in 60 minutes and can only be used once:\n${link}\n\nIf you didn't request this, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171923;max-width:560px;margin:auto"><h1 style="font-size:22px">Reset your TeamForge password</h1><p>Hi ${safeName},</p><p>Use the button below to choose a new password. This link expires in 60 minutes and can only be used once.</p><p><a href="${link}" style="display:inline-block;background:#635bff;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px">Reset password</a></p><p>If you didn't request this, you can ignore this email.</p></div>`,
  });
}

export async function sendPasswordChangedEmail(to: string, name: string) {
  const safeName = escapeHtml(name || "there");
  await sendTransactionalEmail({
    to,
    subject: "Your TeamForge password was changed",
    text: `Hi ${name || "there"},\n\nYour TeamForge password was just changed. If you did not make this change, contact TeamForge support immediately.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#171923;max-width:560px;margin:auto"><h1 style="font-size:22px">Password changed</h1><p>Hi ${safeName},</p><p>Your TeamForge password was just changed. If you did not make this change, contact TeamForge support immediately.</p></div>`,
  });
}
