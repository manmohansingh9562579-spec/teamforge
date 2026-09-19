import { Notification } from "@/models/Notification";
import type { NOTIFICATION_TYPES } from "@/lib/constants";
import type { Types } from "mongoose";

export async function notify(params: {
  userId: Types.ObjectId | string;
  type: (typeof NOTIFICATION_TYPES)[number];
  message: string;
  relatedEntity?: { kind: "team" | "task" | "request" | "user"; id: Types.ObjectId | string };
}) {
  await Notification.create(params);
}
