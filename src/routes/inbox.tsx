import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listMyMessages, replyAsUser, markInboxRead } from "@/lib/contact.functions";
import { useAuth } from "@/contexts/AuthContext";
import { CodeWordGate } from "@/components/CodeWordGate";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — MrsANONymous" },
      { name: "description", content: "Read replies from support to your anonymous messages." },
      { property: "og:title", content: "Inbox — MrsANONymous" },
      { property: "og:description", content: "Read replies from support to your anonymous messages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  const { user, loading } = useAuth();

  const fetchFn = useServerFn(listMyMessages);
  const markRead = useServerFn(markInboxRead);
  const queryClient = useQueryClient();
  const isClient = typeof window !== "undefined";
  const q = useQuery({
    queryKey: ["my-messages", user?.id],
    queryFn: () => fetchFn(),
    enabled: isClient && !!user,
    retry: false,
  });

  // Clear the mail badge as soon as the inbox is open (client only).
  useEffect(() => {
    if (!user || !isClient) return;
    markRead()
      .then(() => {
        queryClient.setQueryData(["unread-count", user.id], 0);
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      })
      .catch(() => {});
  }, [user?.id]);

  if (loading) return <div className="mx-auto max-w-3xl px-5 py-16 text-ink-500">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink-900">Your Inbox</h1>
        <p className="mt-3 text-ink-700">Log in to see replies from support.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/login" className="btn-rose">Log in</Link>
          <Link to="/signup" className="rounded-full border border-ink-900/30 px-4 py-2 text-sm font-semibold text-ink-900">Create account</Link>
        </div>
      </div>
    );
  }

  const messages = (q.data as any[]) ?? [];
  return (
    <CodeWordGate>
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-serif text-4xl text-ink-900">Your Inbox</h1>
      <p className="mt-2 text-ink-700">Messages you sent us and any replies from support.</p>

      {q.isLoading && <p className="mt-6 text-ink-500">Loading…</p>}
      {messages.length === 0 && !q.isLoading && (
        <div className="note-card mt-8 p-6 text-ink-700">
          You haven't sent any messages yet. Use the contact form on any page — while signed in, replies will land here.
        </div>
      )}

      <div className="mt-8 space-y-6">
        {messages.map((m) => (
          <div key={m.id} className="note-card p-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-ink-500">
              <span>{new Date(m.created_at).toLocaleString()}</span>
              <span
                className={
                  m.status === "replied" || m.status === "read" ? "text-green-700" : "text-rose-500"
                }
              >
                {m.status === "replied" || m.status === "read" ? "Replied" : "Awaiting reply"}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-ink-900">{m.message}</p>

            {m.replies?.length > 0 && (
              <div className="mt-5 space-y-3 border-l-2 border-rose-500/40 pl-4">
                {m.replies.map((r: any) => (
                  <div key={r.id}>
                    <div
                      className={`text-[11px] uppercase tracking-widest ${r.fromMe ? "text-ink-500" : "text-rose-500"}`}
                    >
                      {r.fromMe ? "You" : "Support"} · {new Date(r.created_at).toLocaleString()}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-ink-900">{r.body}</p>
                  </div>
                ))}
              </div>
            )}

            <ReplyBox messageId={m.id} />
          </div>
        ))}
      </div>
    </div>
    </CodeWordGate>
  );
}

function ReplyBox({ messageId }: { messageId: string }) {
  return <ThreadReplyBox messageId={messageId} />;
}

function ThreadReplyBox({ messageId }: { messageId: string }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const sendUser = useServerFn(replyAsUser);

  const mutation = useMutation({
    mutationFn: sendUser,
    onSuccess: () => {
      setBody("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["my-messages"] });
    },
    onError: (e) => setError((e as Error).message || "Could not send your reply."),
  });

  return (
    <form
      className="mt-5 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        const text = body.trim();
        if (!text) {
          setError("Write something before sending.");
          return;
        }
        mutation.mutate({ data: { messageId, body: text } });
      }}
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={4000}
        placeholder="Write back to support…"
        className="input-soft"
        data-testid={`inbox-reply-${messageId}`}
      />
      {error && <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">{error}</div>}
      <button type="submit" disabled={mutation.isPending} className="btn-rose">
        {mutation.isPending ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}