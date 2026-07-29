import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/contexts/AuthContext";
import { deleteMyAccount } from "@/lib/account.functions";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account Settings — MrsANONymous" },
      { name: "description", content: "Manage your anonymous account, review your privacy choices, or permanently delete everything you've written." },
      { property: "og:title", content: "Account Settings — MrsANONymous" },
      { property: "og:description", content: "Manage or permanently delete your anonymous account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, loading, logout } = useAuth();
  const navigate = useNavigate();
  const removeAccount = useServerFn(deleteMyAccount);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) return <div className="mx-auto max-w-3xl px-5 py-16 text-ink-500">Loading…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-center">
        <h1 className="font-serif text-3xl text-ink-900">Account Settings</h1>
        <p className="mt-3 text-ink-700">Log in to manage your account.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/login" className="btn-rose">Log in</Link>
        </div>
      </div>
    );
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await removeAccount({});
      await logout();
      navigate({ to: "/" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete your account. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">Account Settings</h1>
      <p className="mt-2 text-ink-700">
        You are signed in as <strong>{profile?.nickname ?? "your nickname"}</strong>. We hold no email,
        phone number, or real name for you.
      </p>

      <section className="note-card mt-8 p-6">
        <h2 className="font-serif text-2xl text-ink-900">Your privacy</h2>
        <ul className="mt-3 ml-5 list-disc space-y-1 text-ink-700">
          <li>Notebooks are private unless you choose to share them.</li>
          <li>Security answers are hashed — nobody, including us, can read them.</li>
          <li>Read the full <Link to="/privacy" className="text-rose-600 underline">Privacy Policy</Link> and{" "}
            <Link to="/terms" className="text-rose-600 underline">Terms of Use</Link>.</li>
        </ul>
      </section>

      <section className="note-card mt-8 border-rose-300 p-6">
        <h2 className="font-serif text-2xl text-ink-900">Delete my account</h2>
        <p className="mt-2 text-ink-700">
          This permanently deletes your account, every notebook and entry, your shared stories, your
          security questions, and your messages. It cannot be undone.
        </p>
        <label className="mt-4 block text-sm font-semibold text-ink-700">
          Type DELETE to confirm
        </label>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 w-full max-w-xs rounded-lg border border-ink-300 bg-white px-3 py-2"
          placeholder="DELETE"
        />
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <button
          onClick={handleDelete}
          disabled={confirm.trim().toUpperCase() !== "DELETE" || busy}
          className="mt-4 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {busy ? "Deleting…" : "Permanently delete my account"}
        </button>
      </section>
    </div>
  );
}
