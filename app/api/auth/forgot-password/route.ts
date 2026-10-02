import { createHash, randomBytes } from "crypto";
import { connectDB } from "@/lib/db";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { isPasswordResetEmailConfigured, sendPasswordResetEmail } from "@/lib/email";
import {
  allowForgotPasswordRequest,
  getClientIp,
} from "@/lib/passwordResetRateLimit";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { User } from "@/models/User";
import { forgotPasswordSchema } from "@/validations/auth";

const GENERIC_MESSAGE = "If an account matches that email, we'll send a password reset link.";
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Enter a valid email address", 400);
    }

    // Fail before account lookup if delivery isn't configured, so the response
    // doesn't reveal whether the submitted email belongs to a TeamForge user.
    if (!isPasswordResetEmailConfigured()) {
      return apiError("Password reset email is not configured yet. Please try again later.", 503);
    }

    await connectDB();
    const email = parsed.data.email;
    const ip = getClientIp(request);
    const allowed = await allowForgotPasswordRequest(email, ip);
    if (!allowed) return apiOk({ message: GENERIC_MESSAGE });

    const user = await User.findOne({ email }).select("name email").lean();
    if (!user) return apiOk({ message: GENERIC_MESSAGE });

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    await PasswordResetToken.deleteMany({ userId: user._id });
    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    try {
      await sendPasswordResetEmail(user.email, user.name, rawToken);
    } catch {
      await PasswordResetToken.deleteOne({ tokenHash });
      console.error("Password reset email could not be delivered.");
    }

    return apiOk({ message: GENERIC_MESSAGE });
  } catch (error) {
    return handleApiError(error);
  }
}
