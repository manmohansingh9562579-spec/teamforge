import { Types } from "mongoose";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getCurrentSession } from "@/lib/session";
import { ContactRequest } from "@/models/ContactRequest";
import { updateContactRequestSchema } from "@/validations/contact";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);
    if (!Types.ObjectId.isValid(params.id) || !/^[a-f\d]{24}$/i.test(params.id)) {
      return apiError("Invalid contact request ID", 400);
    }

    const { action } = updateContactRequestSchema.parse(await req.json());
    await connectDB();

    const request = await ContactRequest.findById(params.id).select("senderId recipientId message status");
    if (!request) return apiError("Contact request not found", 404);

    const isSender = request.senderId.toString() === session.user.id;
    const isRecipient = request.recipientId.toString() === session.user.id;
    if (action === "cancelled" ? !isSender : !isRecipient) return apiError("Forbidden", 403);
    if (request.status !== "pending") return apiError("This request was already resolved", 409);

    const ownerFilter = action === "cancelled"
      ? { senderId: session.user.id }
      : { recipientId: session.user.id };
    const updated = await ContactRequest.findOneAndUpdate(
      { _id: params.id, status: "pending", ...ownerFilter },
      { $set: { status: action } },
      { new: true }
    ).select("senderId recipientId message status createdAt updatedAt");

    if (!updated) return apiError("This request was already resolved", 409);

    if (action === "accepted" || action === "rejected") {
      try {
        await notify({
          userId: updated.senderId,
          type: action === "accepted" ? "contact_accepted" : "contact_rejected",
          message:
            action === "accepted"
              ? "Your contact request was accepted"
              : "Your contact request was declined",
          relatedEntity: { kind: "contact", id: updated._id },
        });
      } catch (err) {
        console.error("Could not create contact response notification", err);
      }
    }

    return apiOk({
      id: updated._id.toString(),
      message: updated.message,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
