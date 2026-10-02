import { createHmac } from "crypto";
import { PasswordResetRateLimit } from "@/models/PasswordResetRateLimit";

const WINDOW_MS = 60 * 60 * 1000;

function hashKey(scope: string, value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return createHmac("sha256", secret).update(`${scope}:${value}`).digest("hex");
}

async function incrementBucket(scope: string, value: string, now: Date) {
  const windowStart = new Date(Math.floor(now.getTime() / WINDOW_MS) * WINDOW_MS);
  const keyHash = hashKey(scope, value);
  const filter = { keyHash, windowStart };

  try {
    const bucket = await PasswordResetRateLimit.findOneAndUpdate(
      filter,
      {
        $inc: { count: 1 },
        $setOnInsert: { expiresAt: new Date(windowStart.getTime() + 2 * WINDOW_MS) },
      },
      { upsert: true, new: true, setDefaultsOnInsert: false }
    ).select("count").lean();
    return bucket?.count ?? 1;
  } catch (error) {
    // A simultaneous first request can win the unique-key upsert race.
    if (!(error && typeof error === "object" && "code" in error && error.code === 11000)) {
      throw error;
    }
    await PasswordResetRateLimit.updateOne(filter, { $inc: { count: 1 } });
    const bucket = await PasswordResetRateLimit.findOne(filter).select("count").lean();
    return bucket?.count ?? 1;
  }
}

export async function allowForgotPasswordRequest(email: string, ip: string) {
  const now = new Date();
  const [emailCount, ipCount] = await Promise.all([
    incrementBucket("forgot-email", email, now),
    incrementBucket("forgot-ip", ip, now),
  ]);
  return emailCount <= 3 && ipCount <= 10;
}

export async function allowPasswordResetAttempt(ip: string) {
  return (await incrementBucket("reset-ip", ip, new Date())) <= 20;
}

export function getClientIp(request: Request) {
  const direct = request.headers.get("x-real-ip")?.trim();
  if (direct) return direct;

  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return forwarded?.at(-1) || "unknown";
}
