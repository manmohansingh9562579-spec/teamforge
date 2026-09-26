import { Types } from "mongoose";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";
import { Message, type IMessage } from "@/models/Message";
import { User } from "@/models/User";
import { createMessageSchema } from "@/validations/message";

const objectIdPattern = /^[a-f\d]{24}$/i;

function serializeMessage(message: Pick<IMessage, "_id" | "senderId" | "receiverId" | "content" | "createdAt">) {
  return {
    id: message._id.toString(),
    senderId: message.senderId.toString(),
    receiverId: message.receiverId.toString(),
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

function getPeerId(rawId: string, currentUserId: string) {
  if (!objectIdPattern.test(rawId) || !Types.ObjectId.isValid(rawId)) {
    return { valid: false as const, error: "Invalid developer ID" as const };
  }

  const peerId = rawId.toLowerCase();
  if (peerId === currentUserId.toLowerCase()) {
    return { valid: false as const, error: "You cannot message yourself" as const };
  }
  return { valid: true as const, peerId };
}

export async function GET(_request: Request, { params }: { params: { userId: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const currentUserId = session.user.id.toLowerCase();
    const peer = getPeerId(params.userId, currentUserId);
    if (!peer.valid) return apiError(peer.error, 400);

    await connectDB();
    const developer = await User.findById(peer.peerId).select("_id name username avatar").lean();
    if (!developer) return apiError("Developer not found", 404);

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: peer.peerId },
        { senderId: peer.peerId, receiverId: currentUserId },
      ],
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(100)
      .select("senderId receiverId content createdAt")
      .lean();

    return apiOk({
      developer: {
        id: developer._id.toString(),
        name: developer.name,
        username: developer.username,
        avatar: developer.avatar,
      },
      messages: messages.reverse().map(serializeMessage),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: { userId: string } }) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const currentUserId = session.user.id.toLowerCase();
    const peer = getPeerId(params.userId, currentUserId);
    if (!peer.valid) return apiError(peer.error, 400);

    const { content } = createMessageSchema.parse(await request.json());
    await connectDB();

    const developerExists = await User.exists({ _id: peer.peerId });
    if (!developerExists) return apiError("Developer not found", 404);

    const message = await Message.create({
      senderId: currentUserId,
      receiverId: peer.peerId,
      content,
    });

    return apiOk({ message: serializeMessage(message) }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
