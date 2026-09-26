import { Types } from "mongoose";
import { apiError, apiOk, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { notify } from "@/lib/notify";
import { getCurrentSession } from "@/lib/session";
import { ContactRequest, type IContactRequest } from "@/models/ContactRequest";
import { User, type IUser } from "@/models/User";
import { createContactRequestSchema } from "@/validations/contact";

const publicProfileFields =
  "name username avatar headline location college graduationYear experienceLevel availability skills preferredRoles interests githubUrl linkedinUrl portfolioUrl";

type PublicContactProfile = Pick<
  IUser,
  | "name"
  | "username"
  | "avatar"
  | "headline"
  | "location"
  | "college"
  | "graduationYear"
  | "experienceLevel"
  | "availability"
  | "skills"
  | "preferredRoles"
  | "interests"
  | "githubUrl"
  | "linkedinUrl"
  | "portfolioUrl"
> & { _id: Types.ObjectId };

type ContactRequestRecord = Pick<
  IContactRequest,
  "_id" | "senderId" | "recipientId" | "message" | "status" | "createdAt" | "updatedAt"
>;

function getPairKey(firstId: string, secondId: string) {
  return [firstId.toLowerCase(), secondId.toLowerCase()].sort().join(":");
}

function toPublicProfile(profile: PublicContactProfile) {
  return {
    id: profile._id.toString(),
    name: profile.name,
    username: profile.username,
    avatar: profile.avatar,
    headline: profile.headline,
    location: profile.location,
    college: profile.college,
    graduationYear: profile.graduationYear,
    experienceLevel: profile.experienceLevel,
    availability: profile.availability,
    skills: profile.skills,
    preferredRoles: profile.preferredRoles,
    interests: profile.interests,
    githubUrl: profile.githubUrl,
    linkedinUrl: profile.linkedinUrl,
    portfolioUrl: profile.portfolioUrl,
  };
}

function toRequest(record: ContactRequestRecord, person: PublicContactProfile | undefined) {
  return {
    id: record._id.toString(),
    message: record.message,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    person: person ? toPublicProfile(person) : null,
  };
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const { recipientId, message } = createContactRequestSchema.parse(await req.json());
    const senderId = session.user.id.toLowerCase();
    if (senderId === recipientId) return apiError("You cannot contact yourself", 400);

    await connectDB();
    const recipient = await User.findById(recipientId).select("_id");
    if (!recipient) return apiError("Developer not found", 404);

    const pairKey = getPairKey(senderId, recipientId);
    const [pending, connected] = await Promise.all([
      ContactRequest.findOne({ pairKey, status: "pending" }).select("senderId"),
      ContactRequest.exists({ pairKey, status: "accepted" }),
    ]);

    if (pending) {
      return apiError(
        pending.senderId.toString() === senderId
          ? "Your request is already pending"
          : "This developer has already sent you a request",
        409
      );
    }
    if (connected) return apiError("You are already connected", 409);

    let contactRequest: IContactRequest;
    try {
      contactRequest = await ContactRequest.create({
        senderId,
        recipientId,
        message,
        pairKey,
      });
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        return apiError("A contact request is already pending between you", 409);
      }
      throw err;
    }

    try {
      await notify({
        userId: recipientId,
        type: "contact_request",
        message: `${session.user.name || "A developer"} sent you a contact request`,
        relatedEntity: { kind: "contact", id: contactRequest._id },
      });
    } catch (err) {
      console.error("Could not create contact request notification", err);
    }

    return apiOk(
      {
        id: contactRequest._id.toString(),
        recipientId,
        message: contactRequest.message,
        status: contactRequest.status,
        createdAt: contactRequest.createdAt,
        updatedAt: contactRequest.updatedAt,
      },
      201
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    await connectDB();
    const currentUserId = session.user.id;
    const { searchParams } = new URL(req.url);
    const otherUserId = searchParams.get("with");

    if (otherUserId !== null) {
      if (!/^[a-f\d]{24}$/i.test(otherUserId)) return apiError("Invalid developer ID", 400);
      const normalizedOtherUserId = otherUserId.toLowerCase();
      if (normalizedOtherUserId === currentUserId.toLowerCase()) return apiError("You cannot contact yourself", 400);

      const otherUserExists = await User.exists({ _id: normalizedOtherUserId });
      if (!otherUserExists) return apiError("Developer not found", 404);

      const latest = await ContactRequest.findOne({
        pairKey: getPairKey(currentUserId, normalizedOtherUserId),
      })
        .sort({ updatedAt: -1, createdAt: -1 })
        .select("senderId status")
        .lean();

      return apiOk({
        relationship: latest
          ? {
              status: latest.status,
              direction: latest.senderId.toString() === currentUserId ? "outgoing" : "incoming",
            }
          : null,
      });
    }

    const [incoming, outgoing, accepted] = await Promise.all([
      ContactRequest.find({ recipientId: currentUserId, status: "pending" })
        .sort({ createdAt: -1 })
        .select("senderId recipientId message status createdAt updatedAt")
        .lean(),
      ContactRequest.find({ senderId: currentUserId, status: "pending" })
        .sort({ createdAt: -1 })
        .select("senderId recipientId message status createdAt updatedAt")
        .lean(),
      ContactRequest.find({
        status: "accepted",
        $or: [{ senderId: currentUserId }, { recipientId: currentUserId }],
      })
        .sort({ updatedAt: -1 })
        .select("senderId recipientId message status createdAt updatedAt")
        .lean(),
    ]);

    const peerIds = [
      ...incoming.map((record) => record.senderId),
      ...outgoing.map((record) => record.recipientId),
      ...accepted.map((record) =>
        record.senderId.toString() === currentUserId ? record.recipientId : record.senderId
      ),
    ];
    const profiles = await User.find({ _id: { $in: peerIds } })
      .select(publicProfileFields)
      .lean<PublicContactProfile[]>();
    const profilesById = new Map(profiles.map((profile) => [profile._id.toString(), profile]));

    return apiOk({
      incoming: incoming.map((record) =>
        toRequest(record as ContactRequestRecord, profilesById.get(record.senderId.toString()))
      ),
      outgoing: outgoing.map((record) =>
        toRequest(record as ContactRequestRecord, profilesById.get(record.recipientId.toString()))
      ),
      connections: accepted.map((record) => {
        const peerId = record.senderId.toString() === currentUserId ? record.recipientId : record.senderId;
        return toRequest(record as ContactRequestRecord, profilesById.get(peerId.toString()));
      }),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === 11000
  );
}
