"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import {
  ArrowDown, ArrowUpRight, Code2, ExternalLink, Github, Heart, Loader2,
  MessageCircle, Radio, Send, Sparkles, Trash2, Trophy, UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, SkillBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type PostType = "build" | "question" | "collaboration";
type Author = { id: string; name: string; username: string; avatar?: string; headline?: string; skills?: string[] };
type Comment = { id: string; content: string; createdAt: string; author: Author | null };
type Post = {
  id: string; type: PostType; content: string; projectName: string; githubUrl: string;
  demoUrl: string; skills: string[]; likeCount: number; likedByMe: boolean;
  commentCount: number; createdAt: string; author: Author | null; comments: Comment[]; isMine: boolean;
};
type Viewer = Author | null;
type FeedResponse = { posts: Post[]; viewer: Viewer; trendingSkills: { name: string; posts: number }[]; nextCursor: string | null };

const filters: { value: "all" | PostType; label: string; icon: typeof Radio }[] = [
  { value: "all", label: "For you", icon: Sparkles },
  { value: "build", label: "Builds", icon: Code2 },
  { value: "question", label: "Questions", icon: MessageCircle },
  { value: "collaboration", label: "Team-ups", icon: UsersRound },
];
const postTypeCopy: Record<PostType, { label: string; tone: "accent" | "warning" | "success"; verb: string }> = {
  build: { label: "BUILD LOG", tone: "accent", verb: "shared a build" },
  question: { label: "QUESTION", tone: "warning", verb: "asked the community" },
  collaboration: { label: "TEAM-UP", tone: "success", verb: "is looking for collaborators" },
};

function timeAgo(value: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function readError(json: any, fallback: string) {
  return typeof json?.error === "string" ? json.error : fallback;
}

export function BuildFeed() {
  const { status } = useSession();
  const [filter, setFilter] = useState<"all" | PostType>("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [trendingSkills, setTrendingSkills] = useState<FeedResponse["trendingSkills"]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentOpen, setCommentOpen] = useState<Record<string, boolean>>({});
  const [commentLoading, setCommentLoading] = useState<Record<string, boolean>>({});
  const [commentPosting, setCommentPosting] = useState<Record<string, boolean>>({});

  const loadFeed = useCallback(async (append = false) => {
    if (append && !cursorRef.current) return;
    append ? setLoadingMore(true) : setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ type: filter });
      if (append && cursorRef.current) params.set("cursor", cursorRef.current);
      const response = await fetch(`/api/feed?${params.toString()}`);
      const json = await response.json();
      if (!response.ok) throw new Error(readError(json, "Could not load the community feed"));
      const data = json.data as FeedResponse;
      setPosts((current) => append ? [...current, ...data.posts] : data.posts);
      setViewer(data.viewer);
      setTrendingSkills(data.trendingSkills);
      cursorRef.current = data.nextCursor;
      setCursor(data.nextCursor);
    } catch (err) {
      setError(true);
      if (append) toast.error(err instanceof Error ? err.message : "Could not load more posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter]);

  useEffect(() => { void loadFeed(); }, [loadFeed]);

  const toggleLike = async (id: string) => {
    if (status !== "authenticated") { void signIn(undefined, { callbackUrl: "/feed" }); return; }
    const current = posts.find((post) => post.id === id);
    if (!current) return;
    setPosts((items) => items.map((post) => post.id === id ? { ...post, likedByMe: !post.likedByMe, likeCount: Math.max(0, post.likeCount + (post.likedByMe ? -1 : 1)) } : post));
    try {
      const response = await fetch(`/api/feed/${id}/like`, { method: "PUT" });
      const json = await response.json();
      if (!response.ok) throw new Error(readError(json, "Could not update reaction"));
      setPosts((items) => items.map((post) => post.id === id ? { ...post, likedByMe: json.data.liked, likeCount: json.data.likeCount } : post));
    } catch (err) {
      setPosts((items) => items.map((post) => post.id === id ? current : post));
      toast.error(err instanceof Error ? err.message : "Could not update reaction");
    }
  };

  const toggleComments = async (post: Post) => {
    if (commentOpen[post.id]) { setCommentOpen((state) => ({ ...state, [post.id]: false })); return; }
    setCommentOpen((state) => ({ ...state, [post.id]: true }));
    if (post.commentCount <= post.comments.length) return;
    setCommentLoading((state) => ({ ...state, [post.id]: true }));
    try {
      const response = await fetch(`/api/feed/${post.id}/comments`);
      const json = await response.json();
      if (!response.ok) throw new Error(readError(json, "Could not load comments"));
      setPosts((items) => items.map((item) => item.id === post.id ? { ...item, comments: json.data.comments } : item));
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not load comments"); }
    finally { setCommentLoading((state) => ({ ...state, [post.id]: false })); }
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>, post: Post) => {
    event.preventDefault();
    const draft = commentDrafts[post.id]?.trim();
    if (!draft) return;
    if (status !== "authenticated") { void signIn(undefined, { callbackUrl: "/feed" }); return; }
    setCommentPosting((state) => ({ ...state, [post.id]: true }));
    try {
      const response = await fetch(`/api/feed/${post.id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: draft }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(readError(json, "Could not add comment"));
      const comment: Comment = json.data.comment;
      setPosts((items) => items.map((item) => item.id === post.id ? { ...item, comments: [...item.comments, comment], commentCount: json.data.commentCount } : item));
      setCommentDrafts((state) => ({ ...state, [post.id]: "" }));
      setCommentOpen((state) => ({ ...state, [post.id]: true }));
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not add comment"); }
    finally { setCommentPosting((state) => ({ ...state, [post.id]: false })); }
  };

  const deletePost = async (post: Post) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      const response = await fetch(`/api/feed/${post.id}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) throw new Error(readError(json, "Could not delete post"));
      setPosts((items) => items.filter((item) => item.id !== post.id));
      toast.success("Post deleted");
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not delete post"); }
  };

  const loadedPostCount = posts.length;
  const popularSkills = useMemo(() => trendingSkills.slice(0, 5), [trendingSkills]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="container-page max-w-[1280px] pb-16 pt-8 md:pt-10">
        <div className="mb-7 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-accent">
              <Radio className="h-3.5 w-3.5" /> The builder network
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-text sm:text-[2.6rem]">Build in public. Build together.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">A signal-rich space for shipping projects, solving problems and meeting your next collaborator.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-success" /></span>
            A community for people who build
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[250px_minmax(0,1fr)_270px] xl:gap-6">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <div className="h-16 bg-gradient-to-r from-accent/80 via-indigo-500 to-cyan-500" />
              <div className="px-5 pb-5">
                <div className="-mt-7"><Avatar name={viewer?.name ?? "Builder"} src={viewer?.avatar} size="xl" className="border-4 border-surface" /></div>
                {viewer ? <>
                  <h2 className="mt-3 text-base font-semibold text-text">{viewer.name}</h2>
                  <Link href={`/developers/${viewer.username}`} className="text-xs text-muted hover:text-accent">@{viewer.username}</Link>
                  <p className="mt-3 line-clamp-2 text-sm text-muted">{viewer.headline || "Add a headline to introduce your work."}</p>
                  {viewer.skills?.length ? <div className="mt-4 flex flex-wrap gap-1.5">{viewer.skills.slice(0, 4).map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}</div> : null}
                  <Link href="/profile/edit" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">Polish your profile <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </> : <>
                  <h2 className="mt-3 text-base font-semibold text-text">Your builder profile</h2>
                  <p className="mt-2 text-sm leading-5 text-muted">Join the conversation and make your work easier to discover.</p>
                  <Button className="mt-4 w-full" onClick={() => void signIn(undefined, { callbackUrl: "/feed" })}>Sign in to join</Button>
                </>}
              </div>
            </Card>

            <Card className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Your builder toolkit</p>
              <div className="mt-3 space-y-1">
                <Link href="/discover" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm font-medium text-text hover:bg-surface-hover"><UsersRound className="h-4 w-4 text-accent" /> Find a collaborator</Link>
                <Link href="/teams" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm font-medium text-text hover:bg-surface-hover"><Code2 className="h-4 w-4 text-accent" /> Explore teams</Link>
                <Link href="/challenges" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm font-medium text-text hover:bg-surface-hover"><Trophy className="h-4 w-4 text-accent" /> Weekly challenge</Link>
              </div>
            </Card>

            <p className="px-2 text-[11px] leading-5 text-muted">Build a coder profile with problem-solving stats, achievements, and proof-of-work links.</p>
          </aside>

          <section className="min-w-0 space-y-4">
            <Card className="flex flex-col gap-3 border-accent/20 bg-accent-soft/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <p className="text-sm font-semibold text-text">Posting is paused for now</p>
                <p className="mt-1 text-xs leading-5 text-muted">Show your coding record and achievements on your developer profile instead.</p>
              </div>
              <Link href={viewer ? "/profile/edit#achievements" : "/signin"} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-3.5 text-xs font-semibold text-on-accent transition-colors hover:bg-accent-hover">Update coder profile <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </Card>

            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 gap-1 overflow-x-auto rounded-xl border border-border bg-surface p-1.5">
                {filters.map((item) => <button key={item.value} onClick={() => setFilter(item.value)} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors", filter === item.value ? "bg-accent text-on-accent shadow-sm" : "text-muted hover:bg-surface-hover hover:text-text")}><item.icon className="h-3.5 w-3.5" />{item.label}</button>)}
              </div>
              <span className="hidden shrink-0 text-xs text-muted sm:inline">{loadedPostCount} in view</span>
            </div>

            {loading ? <div className="space-y-4">{[1, 2, 3].map((item) => <Card key={item} className="h-56 animate-pulse bg-surface/70" />)}</div> : error ? <Card className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger"><Radio className="h-5 w-5" /></div>
              <h2 className="mt-4 text-lg font-semibold text-text">The feed could not load</h2>
              <p className="mt-1 text-sm text-muted">Try again in a moment.</p>
              <Button variant="secondary" className="mt-4" onClick={() => void loadFeed()}>Try again</Button>
            </Card> : posts.length === 0 ? <Card className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Code2 className="h-6 w-6" /></div>
              <h2 className="mt-4 text-lg font-semibold text-text">No community updates yet</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Keep building your coding record. Your solved problem count, achievements, and document links live on your developer profile.</p>
              <Link href={viewer ? "/profile" : "/signin"} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-text transition-colors hover:bg-surface-hover">Open coder profile <ArrowUpRight className="h-4 w-4" /></Link>
            </Card> : <div className="space-y-4">
              {posts.map((post) => {
                const type = postTypeCopy[post.type];
                return <Card key={post.id} className="overflow-hidden transition-shadow hover:shadow-raised">
                  <article>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        {post.author ? <Link href={`/developers/${post.author.username}`} aria-label={`${post.author.name}'s profile`}><Avatar name={post.author.name} src={post.author.avatar} size="lg" /></Link> : <Avatar name="Builder" size="lg" />}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            {post.author ? <Link href={`/developers/${post.author.username}`} className="truncate text-sm font-semibold text-text hover:text-accent">{post.author.name}</Link> : <span className="text-sm font-semibold text-text">TeamForge builder</span>}
                            {post.author?.headline && <span className="hidden text-xs text-muted sm:inline">· {post.author.headline}</span>}
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted">{post.author?.username ? <Link href={`/developers/${post.author.username}`} className="hover:text-accent">@{post.author.username}</Link> : "Community member"} · {timeAgo(post.createdAt)}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2"><Badge tone={type.tone} className="text-[9px] tracking-[0.1em]">{type.label}</Badge><span className="text-[11px] text-muted">{type.verb}</span></div>
                        </div>
                        {post.isMine && <button type="button" aria-label="Delete post" onClick={() => void deletePost(post)} className="rounded-md p-2 text-muted hover:bg-danger/10 hover:text-danger"><Trash2 className="h-4 w-4" /></button>}
                      </div>

                      <div className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-text">{post.content}</div>

                      {post.type === "build" && post.projectName && <div className="mt-4 overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface via-surface to-accent-soft/25">
                        <div className="flex items-start gap-3 p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"><Code2 className="h-5 w-5" /></div>
                          <div className="min-w-0 flex-1"><p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-muted">Project spotlight</p><h3 className="mt-1 text-base font-semibold text-text">{post.projectName}</h3></div>
                          <div className="flex shrink-0 items-center gap-2">
                            {post.githubUrl && <a href={post.githubUrl} target="_blank" rel="noreferrer noopener" aria-label="Open GitHub repository" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-text"><Github className="h-4 w-4" /></a>}
                            {post.demoUrl && <a href={post.demoUrl} target="_blank" rel="noreferrer noopener" aria-label="Open project demo" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-text"><ExternalLink className="h-4 w-4" /></a>}
                          </div>
                        </div>
                        {post.skills.length > 0 && <div className="flex flex-wrap gap-1.5 border-t border-border/70 px-4 py-3">{post.skills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}</div>}
                      </div>}
                      {post.type !== "build" && post.skills.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{post.skills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}</div>}

                      <div className="mt-4 flex items-center justify-between border-b border-border pb-3 text-[11px] text-muted">
                        <span>{post.likeCount ? `${post.likeCount} ${post.likeCount === 1 ? "appreciation" : "appreciations"}` : "Be the first to appreciate this"}</span>
                        <button type="button" onClick={() => void toggleComments(post)} className="hover:text-accent">{post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}</button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button type="button" onClick={() => void toggleLike(post.id)} className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors hover:bg-surface-hover", post.likedByMe ? "text-accent" : "text-muted hover:text-text")}><Heart className={cn("h-4 w-4", post.likedByMe && "fill-current")} /> Appreciate</button>
                        <button type="button" onClick={() => void toggleComments(post)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium text-muted transition-colors hover:bg-surface-hover hover:text-text"><MessageCircle className="h-4 w-4" /> Comment</button>
                      </div>
                    </div>
                    {commentOpen[post.id] && <div className="border-t border-border bg-surface/50 px-4 py-4 sm:px-5">
                      {commentLoading[post.id] ? <div className="flex items-center gap-2 py-2 text-xs text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading conversation…</div> : post.comments.length > 0 ? <div className="mb-4 space-y-3">
                        {post.comments.map((comment) => <div key={comment.id} className="flex items-start gap-2.5">
                          <Avatar name={comment.author?.name ?? "Builder"} src={comment.author?.avatar} size="sm" />
                          <div className="min-w-0 flex-1 rounded-xl bg-surface px-3 py-2.5">
                            <div className="flex items-center justify-between gap-3"><span className="truncate text-xs font-semibold text-text">{comment.author ? <Link href={`/developers/${comment.author.username}`} className="hover:text-accent">{comment.author.name}</Link> : "Builder"}</span><span className="shrink-0 text-[10px] text-muted">{timeAgo(comment.createdAt)}</span></div>
                            <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-text">{comment.content}</p>
                          </div>
                        </div>)}
                      </div> : <p className="mb-3 text-xs text-muted">Start a useful conversation about this post.</p>}
                      <form onSubmit={(event) => void submitComment(event, post)} className="flex items-center gap-2">
                        <Avatar name={viewer?.name ?? "Builder"} src={viewer?.avatar} size="sm" />
                        <input value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((state) => ({ ...state, [post.id]: event.target.value }))} maxLength={800} placeholder={status === "authenticated" ? "Add a thoughtful comment…" : "Sign in to join the conversation"} onFocus={() => { if (status !== "authenticated") void signIn(undefined, { callbackUrl: "/feed" }); }} className="h-10 min-w-0 flex-1 rounded-full border border-border bg-bg px-4 text-xs text-text placeholder:text-muted focus:border-accent focus:outline-none" />
                        <button type="submit" aria-label="Send comment" disabled={commentPosting[post.id] || !commentDrafts[post.id]?.trim()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent disabled:opacity-40"><Send className="h-3.5 w-3.5" /></button>
                      </form>
                    </div>}
                  </article>
                </Card>;
              })}
              {cursor && <div className="flex justify-center py-2"><Button variant="secondary" loading={loadingMore} onClick={() => void loadFeed(true)}><ArrowDown className="h-4 w-4" /> Load more posts</Button></div>}
              {!cursor && <p className="py-5 text-center text-xs text-muted">You are all caught up. Keep your coder profile current.</p>}
            </div>}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-accent to-indigo-700 p-5 text-white">
                <div className="flex items-center justify-between"><Badge tone="neutral" className="border-white/20 bg-white/10 text-white">THIS WEEK</Badge><Trophy className="h-5 w-5 text-white/80" /></div>
                <h2 className="mt-4 text-xl font-semibold tracking-tight">Make it. Share it. Learn.</h2>
                <p className="mt-2 text-xs leading-5 text-white/75">One small build prompt every week. Pair up, try a new tool and show what you learned.</p>
                <Link href="/challenges" className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-indigo-700 transition-transform hover:-translate-y-px">Explore the challenge <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </div>
              <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-[11px] text-muted"><Sparkles className="h-3.5 w-3.5 text-accent" /> Small, free and open to every builder</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-text">Skills in the feed</h2><Code2 className="h-4 w-4 text-accent" /></div>
              <p className="mt-1 text-[11px] text-muted">Tools builders are talking about</p>
              {popularSkills.length ? <div className="mt-4 space-y-2.5">{popularSkills.map((skill, index) => <div key={skill.name} className="flex items-center justify-between gap-3">
                <Link href={`/discover?skill=${encodeURIComponent(skill.name)}`} className="flex min-w-0 items-center gap-2 text-xs font-medium text-text hover:text-accent"><span className="font-mono text-[10px] text-muted">0{index + 1}</span><span className="truncate">{skill.name}</span></Link><span className="shrink-0 text-[10px] text-muted">{skill.posts} posts</span>
              </div>)}</div> : <div className="mt-4 rounded-lg bg-surface-hover/60 p-3"><p className="text-xs leading-5 text-muted">No developer skill signals are available yet.</p></div>}
              <Link href="/discover" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">Browse developer skills <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </Card>

            <Card className="p-4">
              <h2 className="text-sm font-semibold text-text">Make your work discoverable</h2>
              <p className="mt-2 text-xs leading-5 text-muted">Add your stack, GitHub and current interests to your public profile. Good collaborators look for proof of work.</p>
              <Link href={viewer ? "/profile/edit" : "/signup"} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">{viewer ? "Update your profile" : "Create your profile"} <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </Card>

            <div className="flex flex-wrap gap-x-3 gap-y-1 px-2 text-[10px] text-muted"><Link href="/about" className="hover:text-text">About</Link><Link href="/teams" className="hover:text-text">Teams</Link><Link href="/challenges" className="hover:text-text">Challenges</Link><span>TeamForge · built for builders</span></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
