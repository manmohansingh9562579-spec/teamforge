import Link from "next/link";
import { redirect } from "next/navigation";
import { Types } from "mongoose";
import { AppShell } from "@/components/layout/AppShell";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

type LatestConversation = {
  _id: Types.ObjectId;
  content: string;
  senderId: Types.ObjectId;
  createdAt: Date;
  lastMessageId: Types.ObjectId;
};

export default async function MessagesInboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  await connectDB();
  const viewerId = new Types.ObjectId(user._id.toString());
  const latestConversations = await Message.aggregate<LatestConversation>([
    { $match: { $or: [{ senderId: viewerId }, { receiverId: viewerId }] } },
    {
      $addFields: {
        peerId: {
          $cond: [{ $eq: ["$senderId", viewerId] }, "$receiverId", "$senderId"],
        },
      },
    },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $group: {
        _id: "$peerId",
        content: { $first: "$content" },
        senderId: { $first: "$senderId" },
        createdAt: { $first: "$createdAt" },
        lastMessageId: { $first: "$_id" },
      },
    },
    { $sort: { createdAt: -1, lastMessageId: -1 } },
    { $limit: 100 },
  ]);

  const peers = await User.find({ _id: { $in: latestConversations.map((item) => item._id) } })
    .select("_id name username avatar")
    .lean();
  const peersById = new Map(peers.map((peer) => [peer._id.toString(), peer]));
  const conversations = latestConversations.flatMap((item) => {
    const peer = peersById.get(item._id.toString());
    return peer ? [{ ...item, peer }] : [];
  });

  return (
    <AppShell>
      <div className="container-page mx-auto max-w-4xl py-8 sm:py-12">
        <header className="max-w-[640px]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Your inbox</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text sm:text-4xl">Messages</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Continue a conversation with a teammate or a developer in your network.
          </p>
        </header>

        {conversations.length === 0 ? (
          <Card className="mt-8 flex flex-col items-center px-5 py-12 text-center sm:py-16">
            <MessageCircle className="h-8 w-8 text-muted" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold tracking-tight text-text">No conversations yet</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Open a teammate’s profile or your Connections page and choose Message to start a private chat.
            </p>
            <Link
              href="/discover"
              className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
            >
              Discover developers
            </Link>
          </Card>
        ) : (
          <ul className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {conversations.map((conversation) => {
              const peerId = conversation.peer._id.toString();
              const isSentByViewer = conversation.senderId.toString() === viewerId.toString();

              return (
                <li key={peerId}>
                  <Link
                    href={`/messages/${peerId}`}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50 sm:px-5"
                  >
                    <Avatar name={conversation.peer.name} src={conversation.peer.avatar} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">{conversation.peer.name}</p>
                          <p className="truncate text-xs text-muted">@{conversation.peer.username}</p>
                        </div>
                        <time dateTime={conversation.createdAt.toISOString()} className="shrink-0 text-xs text-muted">
                          {conversation.createdAt.toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </time>
                      </div>
                      <p className="mt-2 truncate text-sm text-muted">
                        {isSentByViewer ? "You: " : ""}{conversation.content}
                      </p>
                    </div>
                    <MessageCircle className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
