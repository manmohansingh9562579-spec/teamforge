import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { connectDB } from "@/lib/db";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { sendPasswordChangedEmail } from "@/lib/email";
import { allowPasswordResetAttempt, getClientIp } from "@/lib/passwordResetRateLimit";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { User } from "@/models/User";
import { resetPasswordSchema } from "@/validations/auth";

const INVALID_LINK_MESSAGE = "This reset link is invalid or expired. Request a new one.";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Check your password and try again", 400);
    }

    await connectDB();
    const ip = getClientIp(request);
    if (!(await allowPasswordResetAttempt(ip))) {
      return apiError("Too many attempts. Please wait and try again.", 429);
    }

    const tokenHash = createHash("sha256").update(parsed.data.token.toLowerCase()).digest("hex");
    const resetToken = await PasswordResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    }).select("userId").lean();

    if (!resetToken) return apiError(INVALID_LINK_MESSAGE, 400);

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    // Delete atomically so a token can't be used twice, even by concurrent requests.
    const consumedToken = await PasswordResetToken.findOneAndDelete({
      _id: resetToken._id,
      expiresAt: { $gt: new Date() },
    }).select("userId").lean();
    if (!consumedToken) return apiError(INVALID_LINK_MESSAGE, 400);

    const user = await User.findByIdAndUpdate(
      consumedToken.userId,
      { $set: { passwordHash: passwordHash }, $inc: { authVersion: 1 } },
      { new: true }
    ).select("name email").lean();

    await PasswordResetToken.deleteMany({ userId: consumedToken.userId });
    if (!user) return apiError(INVALID_LINK_MESSAGE, 400);

    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch {
      console.error("Password change notification email could not be delivered.");
    }

    return apiOk({ message: "Password updated. Sign in with your new password." });
  } catch (error) {
    return handleApiError(error);
  }
}
