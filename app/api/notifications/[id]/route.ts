import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getCurrentSession } from "@/lib/session";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    const notification = await Notification.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return apiError("Notification not found", 404);
    return apiOk(notification);
  } catch (err) {
    return handleApiError(err);
  }
}
