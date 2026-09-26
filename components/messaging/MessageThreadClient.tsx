"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

type ConversationMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
};

type DeveloperSummary = {
  id: string;
  name: string;
  username: string;
  avatar?: string | null;
};

type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

type ConversationResponse = {
  developer: DeveloperSummary;
  messages: ConversationMessage[];
};

function mergeMessages(current: ConversationMessage[], incoming: ConversationMessage[]) {
  const uniqueMessages = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => uniqueMessages.set(message.id, message));

  return [...uniqueMessages.values()]
    .sort((left, right) => {
      const timeDifference = new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      return timeDifference || left.id.localeCompare(right.id);
    })
    .slice(-100);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function MessageThreadClient({
  developerId,
  viewerId,
}: {
  developerId: string;
  viewerId: string;
}) {
  const [developer, setDeveloper] = useState<DeveloperSummary | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const requestInFlight = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversation = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;

    try {
      const response = await fetch(`/api/messages/${encodeURIComponent(developerId)}`, {
        cache: "no-store",
      });
      const result = (await response.json()) as ApiResponse<ConversationResponse>;
      if (!response.ok || !result.data) throw new Error(result.error ?? "Could not load this conversation");

      setDeveloper(result.data.developer);
      setMessages((current) => mergeMessages(current, result.data!.messages));
      setLoadError(null);
    } catch (error) {
      setLoadError(getErrorMessage(error, "Could not load this conversation"));
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }, [developerId]);

  useEffect(() => {
    void loadConversation();
    const refreshTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadConversation();
    }, 5000);
    const refreshOnFocus = () => void loadConversation();
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [loadConversation]);

  const latestMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "auto" });
  }, [latestMessageId]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setSendError(null);

    try {
      const response = await fetch(`/api/messages/${encodeURIComponent(developerId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const result = (await response.json()) as ApiResponse<{ message: ConversationMessage }>;
      if (!response.ok || !result.data) throw new Error(result.error ?? "Could not send your message");

      setMessages((current) => mergeMessages(current, [result.data!.message]));
      setDraft("");
    } catch (error) {
      setSendError(getErrorMessage(error, "Could not send your message"));
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void sendMessage();
    }
  };

  if (loading && !developer) {
    return (
      <Card className="flex h-[min(72dvh,760px)] min-h-[360px] flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border p-4 sm:px-5">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex-1 space-y-4 p-5">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="ml-auto h-12 w-1/2" />
          <Skeleton className="h-16 w-3/4" />
        </div>
        <div className="border-t border-border p-4">
          <Skeleton className="h-11 w-full" />
        </div>
      </Card>
    );
  }

  if (!developer) {
    return (
      <Card role="alert" className="p-6">
        <h1 className="text-lg font-semibold text-text">Couldn’t open this conversation</h1>
        <p className="mt-2 text-sm text-muted">{loadError ?? "The developer could not be found."}</p>
        <Button variant="secondary" className="mt-4" onClick={() => void loadConversation()}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <section
      aria-label={`Conversation with ${developer.name}`}
      className="flex h-[min(72dvh,760px)] min-h-[360px] flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card sm:h-[min(76dvh,800px)] sm:min-h-[480px]"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
        <Link
          href={`/developers/${encodeURIComponent(developer.username)}`}
          aria-label={`View ${developer.name}'s profile`}
          className="-ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Avatar name={developer.name} src={developer.avatar} size="md" />
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-text">{developer.name}</h1>
          <p className="truncate text-xs text-muted">@{developer.username}</p>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6" role="log" aria-label="Messages" aria-live="polite">
        {loadError && (
          <p role="status" className="mx-auto max-w-md rounded-lg border border-border bg-surface-hover px-3 py-2 text-center text-xs text-muted">
            Messages could not refresh. Retrying automatically.
          </p>
        )}
        {messages.length === 0 ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
            <MessageCircle className="h-8 w-8 text-muted" aria-hidden="true" />
            <p className="mt-3 text-sm text-muted">No messages yet. Start the conversation.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSent = message.senderId === viewerId;
            const timestamp = new Date(message.createdAt);
            const timeLabel = Number.isNaN(timestamp.getTime())
              ? ""
              : timestamp.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

            return (
              <div key={message.id} className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 sm:max-w-[75%] ${
                    isSent ? "rounded-br-md bg-accent text-on-accent" : "rounded-bl-md bg-surface-hover text-text"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
                  <time
                    dateTime={message.createdAt}
                    className={`mt-1 block text-right text-[10px] ${isSent ? "text-on-accent/75" : "text-muted"}`}
                  >
                    {timeLabel}
                  </time>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} aria-hidden="true" />
      </div>

      <form onSubmit={handleSubmit} className="shrink-0 border-t border-border p-3 sm:p-4">
        {sendError && <p role="alert" className="mb-2 text-sm text-danger">{sendError}</p>}
        <div className="flex items-end gap-2">
          <label htmlFor="message-composer" className="sr-only">Type a message</label>
          <textarea
            id="message-composer"
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 4000))}
            onKeyDown={handleComposerKeyDown}
            rows={1}
            maxLength={4000}
            placeholder="Type a message..."
            className="max-h-32 min-h-11 flex-1 resize-y rounded-lg border border-border bg-bg px-3 py-2.5 text-sm leading-relaxed text-text placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <Button type="submit" loading={sending} disabled={!draft.trim()} className="h-11 shrink-0 px-3 sm:px-4">
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>Send</span>
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-muted">Enter to send · Shift+Enter for a new line</p>
      </form>
    </section>
  );
}
