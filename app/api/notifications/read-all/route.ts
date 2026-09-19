import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getCurrentSession } from "@/lib/session";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export async function PATCH() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    await Notification.updateMany(
      { userId: session.user.id, isRead: false },
      { isRead: true }
    );

    return apiOk({ updated: true });
  } catch (err) {
    return handleApiError(err);
  }
}
