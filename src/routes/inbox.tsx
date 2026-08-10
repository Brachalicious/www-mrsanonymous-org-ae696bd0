import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllMessages, listMyMessages, replyAsUser, replyToMessage } from "@/lib/contact.functions";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user, isAdmin, loading } = useAuth();
  const fetchFn = useServerFn(listMyMessages);
  const fetchSupportFn = useServerFn(listAllMessages);
  const q = useQuery({
    queryKey: ["my-messages", user?.id],
    queryFn: () => fetchFn(),
    enabled: !!user,
  });
  const supportQuery = useQuery({
    queryKey: ["admin-messages", user?.id],
    queryFn: () => fetchSupportFn(),
    enabled: !!user && isAdmin,
  });

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
  const supportMessages = (supportQuery.data as any[]) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-serif text-4xl text-ink-900">Your Inbox</h1>
      <p className="mt-2 text-ink-700">Messages you sent us and any replies from support.</p>

      {isAdmin && (
        <section className="mt-8 border-y border-rose-500/30 py-6" aria-labelledby="support-inbox-heading">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="support-inbox-heading" className="font-serif text-2xl text-ink-900">Support Inbox</h2>
              <p className="mt-1 text-sm text-ink-700">Messages from users waiting for support.</p>
            </div>
            <Link to="/admin/messages" className="rounded-full border border-ink-900/30 px-4 py-2 text-sm font-semibold text-ink-900">Full view</Link>
          </div>
          {supportQuery.isLoading && <p className="mt-4 text-ink-500">Loading support messages…</p>}
          {supportQuery.isError && (
            <div role="alert" className="mt-4 rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">
              Support messages could not load. Log out, log back into the admin account, and try again.
            </div>
          )}
          {!supportQuery.isLoading && !supportQuery.isError && (
            <div className="mt-4 space-y-4">
              {supportMessages.length === 0 ? (
                <p className="text-sm text-ink-500">No support messages yet.</p>
              ) : (
                supportMessages.map((message) => (
                  <div key={message.id} className="note-card p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-widest text-ink-500">
                      <span>{message.sender_nickname ? `From ${message.sender_nickname}` : "Anonymous visitor"}</span>
                      <span>{new Date(message.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-ink-900">{message.message}</p>
                    {message.replies?.length > 0 && (
                      <div className="mt-4 space-y-3 border-l-2 border-rose-500/40 pl-4">
                        {message.replies.map((r: any) => (
                          <div key={r.id}>
                            <div className="text-[11px] uppercase tracking-widest text-ink-500">
                              {new Date(r.created_at).toLocaleString()}
                            </div>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-ink-900">{r.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {message.sender_user_id ? (
                      <AdminReplyBox messageId={message.id} />
                    ) : (
                      <p className="mt-3 text-xs text-ink-500">
                        Sent without an account — no inbox to reply into.
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </section>
      )}

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
              <span className={m.status === "replied" ? "text-green-700" : "text-rose-500"}>
                {m.status === "replied" ? "Replied" : "Awaiting reply"}
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
  );
}

function ReplyBox({ messageId }: { messageId: string }) {
  return <ThreadReplyBox messageId={messageId} admin={false} />;
}

function AdminReplyBox({ messageId }: { messageId: string }) {
  return <ThreadReplyBox messageId={messageId} admin />;
}

function ThreadReplyBox({ messageId, admin }: { messageId: string; admin: boolean }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const sendUser = useServerFn(replyAsUser);
  const sendAdmin = useServerFn(replyToMessage);
  const send = admin ? sendAdmin : sendUser;

  const mutation = useMutation({
    mutationFn: send,
    onSuccess: () => {
      setBody("");
      setError("");
      queryClient.invalidateQueries({ queryKey: admin ? ["admin-messages"] : ["my-messages"] });
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
        placeholder={admin ? "Reply to this person…" : "Write back to support…"}
        className="input-soft"
        data-testid={`${admin ? "admin" : "inbox"}-reply-${messageId}`}
      />
      {error && <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">{error}</div>}
      <button type="submit" disabled={mutation.isPending} className="btn-rose">
        {mutation.isPending ? "Sending…" : "Send reply"}
      </button>
    </form>
  );
}