import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getCurrentSession } from "@/lib/session";
import { apiOk, apiError, handleApiError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const pageSize = 20;

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      Notification.countDocuments({ userId: session.user.id, isRead: false }),
      Notification.countDocuments({ userId: session.user.id }),
    ]);

    return apiOk({ notifications, unreadCount, total, page, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    return handleApiError(err);
  }
}
