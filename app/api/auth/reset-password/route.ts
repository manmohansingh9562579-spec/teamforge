import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { resetPasswordApiSchema } from "@/validations/auth";

export async function POST(req: Request) {
  try {
    const parsed = resetPasswordApiSchema.safeParse(await req.json());
    if (!parsed.success) {
      return apiError("Enter a valid reset link and a strong password", 400);
    }

    await connectDB();
    const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex");
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.findOneAndUpdate(
      {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { $gt: new Date() },
      },
      {
        $set: { passwordHash },
        $unset: {
          passwordResetTokenHash: 1,
          passwordResetExpiresAt: 1,
          passwordResetRequestedAt: 1,
        },
      },
      { new: true }
    ).select("_id");

    if (!user) return apiError("This reset link is invalid or has expired. Request a new one.", 400);

    return apiOk({ message: "Your password has been changed. You can sign in now." });
  } catch (error) {
    return handleApiError(error);
  }
}
