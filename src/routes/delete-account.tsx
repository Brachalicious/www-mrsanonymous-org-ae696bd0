import { createFileRoute, Link } from "@tanstack/react-router";

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

      <h2 className="mt-8 font-serif text-2xl text-ink-900">How to delete</h2>
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

      <h2 className="mt-8 font-serif text-2xl text-ink-900">Can&apos;t sign in?</h2>
      <p className="mt-3 text-ink-700">
        Use{" "}
        <Link to="/forgot-password" className="text-rose-600 underline">
          password recovery
        </Link>{" "}
        with your security questions, or reach us through the{" "}
        <Link to="/contact" className="text-rose-600 underline">
          contact form
        </Link>{" "}
        and we will delete the account for you.
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
