import { randomBytes, createHash } from "crypto";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import {
  getAppUrl,
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} from "@/lib/passwordResetEmail";
import { User } from "@/models/User";
import { forgotPasswordSchema } from "@/validations/auth";

const genericResponse = {
  message: "If an account exists for that email, reset instructions will arrive shortly.",
};
const REQUEST_COOLDOWN_MS = 60_000;

export async function POST(req: Request) {
  try {
    const parsed = forgotPasswordSchema.safeParse(await req.json());
    if (!parsed.success) return apiError("Enter a valid email address", 400);

    // Check configuration before looking up the account, so this response does not
    // reveal whether the submitted address belongs to a TeamForge user.
    if (!isPasswordResetEmailConfigured()) {
      return apiError("Password reset email is not configured yet", 503);
    }

    await connectDB();
    const now = new Date();
    const user = await User.findOne({ email: parsed.data.email }).select(
      "+passwordResetRequestedAt"
    );
    if (!user) return apiOk(genericResponse);

    const cooldownStartedAt = new Date(now.getTime() - REQUEST_COOLDOWN_MS);
    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,
        $or: [
          { passwordResetRequestedAt: { $exists: false } },
          { passwordResetRequestedAt: { $lt: cooldownStartedAt } },
        ],
      },
      {
        $set: {
          passwordResetTokenHash: tokenHash,
          passwordResetExpiresAt: new Date(now.getTime() + 30 * 60_000),
          passwordResetRequestedAt: now,
        },
      },
      { new: true }
    ).select("name email");

    if (!updatedUser) return apiOk(genericResponse);

    const resetUrl = new URL("/reset-password", getAppUrl());
    resetUrl.searchParams.set("token", token);

    try {
      await sendPasswordResetEmail({
        to: updatedUser.email,
        name: updatedUser.name,
        resetUrl: resetUrl.toString(),
      });
    } catch {
      // Do not log the email address or one-time token. Remove the unused token so
      // the person can request a new link immediately if delivery failed.
      console.error("Password reset email delivery failed");
      await User.updateOne(
        { _id: updatedUser._id, passwordResetTokenHash: tokenHash },
        { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1, passwordResetRequestedAt: 1 } }
      );
    }

    return apiOk(genericResponse);
  } catch (error) {
    return handleApiError(error);
  }
}
