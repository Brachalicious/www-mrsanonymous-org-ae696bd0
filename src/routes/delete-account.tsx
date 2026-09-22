import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { sendContactMessage } from "@/lib/contact.functions";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/delete-account")({
  head: () => ({
    meta: [
      { title: "Delete Your Account & Data — MrsANONymous" },
      {
        name: "description",
        content:
          "How to permanently delete your MrsANONymous account and every note, story, and message linked to it. No email required.",
      },
      { property: "og:title", content: "Delete Your Account & Data — MrsANONymous" },
      {
        property: "og:description",
        content: "Permanently delete your anonymous account and all of your data in one step.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www-mrsanonymous-org.lovable.app/delete-account" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://www-mrsanonymous-org.lovable.app/delete-account" }],
  }),
  component: DeleteAccountPage,
});

function DeleteAccountPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">Delete your account and data</h1>
      <p className="mt-3 text-ink-700">
        MrsANONymous (app: <strong>MrsANONymous — Safety &amp; Support</strong>) lets you delete your
        account and everything stored with it, at any time, without contacting us.
      </p>

      <h2 className="mt-8 font-serif text-2xl text-ink-900">How to delete yourself</h2>
      <ol className="mt-3 ml-5 list-decimal space-y-2 text-ink-700">
        <li>Open the app or website and sign in with your nickname and password.</li>
        <li>
          Go to{" "}
          <Link to="/settings" className="text-rose-600 underline">
            Settings
          </Link>
          .
        </li>
        <li>
          Tap <strong>Permanently delete my account</strong> and confirm.
        </li>
      </ol>

      <h2 className="mt-8 font-serif text-2xl text-ink-900">What gets deleted</h2>
      <ul className="mt-3 ml-5 list-disc space-y-1 text-ink-700">
        <li>Your account (nickname, password hash, security-question hashes).</li>
        <li>Every notebook, journal entry, recording, and uploaded file.</li>
        <li>Every story you shared, and your support messages with us.</li>
      </ul>
      <p className="mt-3 text-ink-700">
        Deletion is immediate and permanent. Nothing is retained afterwards except, where legally
        required, minimal abuse/moderation records that contain no personal identifiers. Content you
        stored only on your own device (saved addresses, codeword, calculator passcode) is removed
        when you clear the app&apos;s data or uninstall it.
      </p>

      <DeletionRequestForm />

      <h2 className="mt-8 font-serif text-2xl text-ink-900">Can&apos;t sign in?</h2>
      <p className="mt-3 text-ink-700">
        Use{" "}
        <Link to="/forgot-password" className="text-rose-600 underline">
          password recovery
        </Link>{" "}
        with your security questions, or send the deletion request above with your nickname and we
        will delete the account for you.
      </p>

      <p className="mt-8 text-sm text-ink-500">
        See our{" "}
        <Link to="/privacy" className="text-rose-600 underline">
          Privacy Policy
        </Link>{" "}
        for full details on what we do and do not collect.
      </p>
    </article>
  );
}

function DeletionRequestForm() {
  const send = useServerFn(sendContactMessage);
  const { user, profile } = useAuth();
  const [nickname, setNickname] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState("");

  const mutation = useMutation({
    mutationFn: send,
    onSuccess: () => {
      setStatus("✓ Deletion request received. We will delete the account and all of its data.");
    },
    onError: (err) => {
      setStatus((err as Error).message || "Could not send the request. Please try again.");
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) {
      setStatus("Please confirm you want the account permanently deleted.");
      return;
    }
    const nick = profile?.nickname ?? nickname.trim();
    if (!nick) {
      setStatus("Please enter the nickname of the account to delete.");
      return;
    }
    setStatus("");
    const message = [
      "ACCOUNT DELETION REQUEST",
      `Nickname: ${nick}`,
      user?.id ? `Account ID: ${user.id}` : null,
      "Requested via the delete-account page. Please delete this account and all associated data.",
    ]
      .filter(Boolean)
      .join("\n");
    mutation.mutate({ data: { message, audience: "women", userId: user?.id ?? null } });
  }

  return (
    <div className="note-card mt-10 p-7">
      <div className="text-xs font-bold uppercase tracking-[0.3em] text-rose-500">
        Request deletion
      </div>
      <p className="mt-2 text-ink-700">
        Prefer to have us do it? Send a deletion request here. If you are signed in we can find your
        account automatically; otherwise, enter the nickname of the account.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        {!user && (
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
              Account nickname
            </span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={60}
              className="input-soft mt-1.5"
              placeholder="the nickname you signed up with"
            />
          </label>
        )}
        {user && (
          <p className="text-sm text-ink-600">
            Requesting deletion for the signed-in account{" "}
            <strong>{profile?.nickname ?? "your account"}</strong>.
          </p>
        )}

        <label className="flex items-start gap-3 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 accent-rose-500"
          />
          <span>
            I understand this permanently deletes the account, every note, recording, story, and
            message linked to it. This cannot be undone.
          </span>
        </label>

        {status && (
          <div
            className={`rounded-md px-3 py-2 text-sm ${status.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-emergency/10 text-emergency"}`}
          >
            {status}
          </div>
        )}

        <button type="submit" disabled={mutation.isPending} className="btn-rose w-full">
          {mutation.isPending ? "Sending request…" : "Request account and data deletion"}
        </button>

        <p className="text-[11px] leading-relaxed text-ink-500">
          No email address is needed. Requests are sent straight to our support team, who delete the
          account and everything stored with it.
        </p>
      </form>
    </div>
  );
}
