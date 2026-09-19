import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { getCurrentSession } from "@/lib/session";
import { profileSchema } from "@/services/profileService";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export async function GET() {
  const session = await getCurrentSession();
  if (!session?.user?.id) return apiError("Unauthorized", 401);

  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return apiError("User not found", 404);

  return apiOk(user);
}

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const body = await req.json();
    const data = profileSchema.partial().parse(body);

    await connectDB();
    // Authorization is derived from the session, never from a client-supplied id.
    const user = await User.findByIdAndUpdate(session.user.id, data, {
      new: true,
      runValidators: true,
    });

    if (!user) return apiError("User not found", 404);
    return apiOk(user);
  } catch (err) {
    return handleApiError(err);
  }
}
