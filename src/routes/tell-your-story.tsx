import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { StoriesBoard } from "@/components/StoriesBoard";
import { NotebookList } from "@/components/NotebookList";

export const Route = createFileRoute("/tell-your-story")({
  validateSearch: z.object({
    tab: z.enum(["story", "mine", "entries"]).optional().catch("story"),
  }),
  head: () => ({
    meta: [
      { title: "Tell Your Story — MrsANONymous.org" },
      { name: "description", content: "Share your story in your own private notebook, or read blurred stories from the community board. No names required." },
      { property: "og:title", content: "Tell Your Story — MrsANONymous.org" },
      { property: "og:description", content: "Share your story in your own private notebook. No names required." },
    ],
  }),
  component: TellYourStoryPage,
});

function TellYourStoryPage() {
  const { tab } = Route.useSearch();

  const tabs = [
    { key: "story", label: "The Board" },
    { key: "mine", label: "My Notebooks" },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
      <div className="mb-8 text-center">
        <span className="hand-note text-2xl">your words, your choice</span>
        <h1 className="mt-2 font-serif text-4xl text-ink-900">Tell Your Story</h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-600">
          Write privately in a notebook only you can open. If you want, share it to the community board —
          blurred by default, and always anonymous or by your nickname, your choice.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              to="/tell-your-story"
              search={{ tab: t.key }}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-rose-500 text-white"
                  : "border border-ink-300 text-ink-700 hover:bg-cream-100"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {tab === "story" && (
        <section aria-label="Community board">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-ink-900">The Board</h2>
            <span className="text-sm text-ink-500">Tap a card to reveal. Take your time.</span>
          </div>
          <StoriesBoard />
        </section>
      )}

      {tab === "mine" && (
        <section aria-label="My notebooks">
          <NotebookList />
        </section>
      )}
    </div>
  );
}
