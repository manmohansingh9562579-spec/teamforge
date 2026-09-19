import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User, type IUser } from "@/models/User";

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

/**
 * Returns the full current user document from the database, or null.
 * Never trust client-provided user IDs — this always derives identity
 * from the server-verified session.
 */
export async function getCurrentUser(): Promise<
  (IUser & { _id: any }) | null
> {
  const session = await getCurrentSession();
  if (!session?.user?.id) return null;

  await connectDB();
  const user = await User.findById(session.user.id);
  return user as any;
}
