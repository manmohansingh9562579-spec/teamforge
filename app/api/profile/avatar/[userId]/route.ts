import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { ProfilePhoto } from "@/models/ProfilePhoto";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const routeParams = await params;
  if (!Types.ObjectId.isValid(routeParams.userId)) return new Response("Not found", { status: 404 });

  await connectDB();
  const photo = await ProfilePhoto.findOne({ userId: routeParams.userId })
    .select("contentType data updatedAt");

  if (!photo) return new Response("Not found", { status: 404 });

  const headers = new Headers({
    "Content-Type": photo.contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });
  headers.set("Last-Modified", photo.updatedAt.toUTCString());

  return new Response(new Uint8Array(photo.data), { headers });
}
