import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { signUpSchema } from "@/validations/auth";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, password } = signUpSchema.parse(body);

    await connectDB();

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? "email" : "username";
      return apiError(`This ${field} is already taken`, 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      username,
      email,
      passwordHash,
      skills: [],
      preferredRoles: [],
      interests: [],
    });

    return apiOk(
      { id: user._id.toString(), username: user.username, name: user.name },
      201
    );
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return handleApiError(err);
  }
}
