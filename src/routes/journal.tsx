import { createFileRoute } from "@tanstack/react-router";
import { PrivateJournal } from "@/components/PrivateJournal";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Private Journal — MrsANONymous.org" },
      { name: "description", content: "A private, password-protected place to document incidents with dates, details, photos and voice notes. Only you can open it." },
      { property: "og:title", content: "Private Journal — MrsANONymous.org" },
      { property: "og:description", content: "Document incidents privately: dates, details, photos and voice notes only you can open." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-10">
      <div className="mb-8 text-center">
        <span className="hand-note text-2xl">just for you</span>
        <h1 className="mt-2 font-serif text-4xl text-ink-900">Private Journal</h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-600">
          A safe place to document what happened — dates, details, injuries, witnesses, photos and voice
          notes. Nothing here is ever shared to the board. Only your account can open it.
        </p>
      </div>
      <PrivateJournal />
    </div>
  );
}