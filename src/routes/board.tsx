import { createFileRoute } from "@tanstack/react-router";
import { StoriesBoard } from "@/components/StoriesBoard";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "The Board — MrsANONymous.org" },
      { name: "description", content: "Read anonymous, blurred stories from women and girls. No identifying details, no comments, just community." },
      { property: "og:title", content: "The Board — MrsANONymous.org" },
      { property: "og:description", content: "Read anonymous, blurred stories from women and girls. No identifying details." },
    ],
  }),
  component: BoardPage,
});

function BoardPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
      <div className="mb-8 text-center">
        <span className="hand-note text-2xl">you are not alone</span>
        <h1 className="mt-2 font-serif text-4xl text-ink-900">The Board</h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-600">
          A community feed of anonymous stories. Names and identifying details are removed or blurred.
          Tap a card to reveal it when you feel ready. React only if it feels safe.
        </p>
      </div>
      <StoriesBoard />
    </div>
  );
}
