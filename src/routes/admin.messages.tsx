import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listAllMessages, replyToMessage } from "@/lib/contact.functions";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/admin/messages")({
  validateSearch: (search: Record<string, unknown>) => ({
    thread: typeof search['thread'] === "string" ? (search['thread'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin — Support Messages" },
      { name: "description", content: "Support inbox for MrsANONymous administrators." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminMessages,
});

function AdminMessages() {
  const { user, isAdmin, loading } = useAuth();
  const { thread } = Route.useSearch();
  const list = useServerFn(listAllMessages);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => list(),
    enabled: !!user && isAdmin,
  });

  if (loading) return <div className="mx-auto max-w-4xl px-5 py-16 text-ink-500">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink-900">Admin Support Inbox</h1>
        <p className="mt-3 text-ink-700">Please log in.</p>
        <Link to="/login" className="btn-rose mt-6 inline-block">Log in</Link>
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink-900">Not authorized</h1>
        <p className="mt-3 text-ink-700">This page is only available to support administrators.</p>
      </div>
    );
  }

  const messages = (q.data as any[]) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl text-ink-900">Support Inbox</h1>
        <Link
          to="/inbox"
          data-testid="admin-my-inbox"
          className="inline-flex items-center gap-2 rounded-full border border-ink-900/30 px-4 py-2 text-sm font-semibold text-ink-900 hover:bg-ink-900 hover:text-white"
        >
          📬 My Inbox
        </Link>
      </div>
      <p className="mt-2 text-ink-700">Reply to visitor messages. Replies appear in the visitor's Inbox — no email is sent or required.</p>

      {q.isLoading && <p className="mt-6 text-ink-500">Loading…</p>}
      {q.isError && (
        <div role="alert" className="mt-6 rounded-md bg-emergency/10 px-4 py-3 text-sm text-emergency">
          Support messages could not load. Please log out, log back into the BrittanyJ admin account, and try again.
        </div>
      )}
      {messages.length === 0 && !q.isLoading && (
        <div className="note-card mt-8 p-6 text-ink-700">
          {q.isError ? "Your support inbox is temporarily unavailable." : "No messages yet."}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {messages.map((m) => (
          <MessageCard
            key={m.id}
            m={m}
            highlighted={thread === m.id}
            onReplied={() => qc.invalidateQueries({ queryKey: ["admin-messages"] })}
          />
        ))}
      </div>
    </div>
  );
}

function MessageCard({ m, highlighted, onReplied }: { m: any; highlighted?: boolean; onReplied: () => void }) {
  const [body, setBody] = useState("");
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlighted]);
  const reply = useServerFn(replyToMessage);
  const mutation = useMutation({
    mutationFn: reply,
    onSuccess: () => {
      setBody("");
      onReplied();
    },
  });

  const canReplyToAccount = !!m.sender_user_id;

  return (
    <div ref={cardRef} className={`note-card p-6 ${highlighted ? "ring-2 ring-rose-500" : ""}`}>
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-ink-500">
        <span>
          {m.sender_nickname ? `From ${m.sender_nickname}` : "Anonymous visitor"} · {m.audience}
        </span>
        <span>{new Date(m.created_at).toLocaleString()}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-ink-900">{m.message}</p>

      {m.replies?.length > 0 && (
        <div className="mt-5 space-y-3 border-l-2 border-rose-500/40 pl-4">
          {m.replies.map((r: any) => (
            <div key={r.id}>
              <div
                className={`text-[11px] uppercase tracking-widest ${
                  r.author_user_id && r.author_user_id === m.sender_user_id ? "text-ink-500" : "text-rose-500"
                }`}
              >
                {r.author_user_id && r.author_user_id === m.sender_user_id
                  ? `${m.sender_nickname ?? "User"} (sender)`
                  : "Support"}{" "}
                · {new Date(r.created_at).toLocaleString()}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-ink-900">{r.body}</p>
            </div>
          ))}
        </div>
      )}

      {canReplyToAccount ? (
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!body.trim()) return;
            mutation.mutate({ data: { messageId: m.id, body: body.trim() } });
          }}
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="input-soft"
            placeholder="Write a reply to this visitor's Inbox…"
          />
          <button type="submit" disabled={mutation.isPending} className="btn-rose">
            {mutation.isPending ? "Sending…" : "Send reply"}
          </button>
          {mutation.error && (
            <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">
              {(mutation.error as Error).message}
            </div>
          )}
        </form>
      ) : (
        <p className="mt-5 rounded-md bg-ink-100 px-3 py-2 text-xs text-ink-500">
          This visitor was not signed in, so there is no account to reply to.
        </p>
      )}
    </div>
  );
}