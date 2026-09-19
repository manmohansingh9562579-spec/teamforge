import type { ReactNode } from "react";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getCurrentUser } from "@/lib/session";
import { AppTopbar } from "./AppTopbar";
import { Sidebar } from "./Sidebar";
import { MobileNavigation } from "./MobileNavigation";

export async function AppShell({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  let unreadCount = 0;
  if (user) {
    await connectDB();
    unreadCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
    });
  }

  return (
    <div className="min-h-screen">
      <AppTopbar
        name={user?.name ?? "Account"}
        image={user?.avatar}
        unreadCount={unreadCount}
      />
      <div className="flex">
        <Sidebar unreadCount={unreadCount} />
        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <MobileNavigation unreadCount={unreadCount} />
    </div>
  );
}
