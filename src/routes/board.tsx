import { createFileRoute } from "@tanstack/react-router";

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
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">The Board</h1>
      <p className="mt-6 text-ink-600">
        A community feed of anonymous stories. Names and identifying details are removed or blurred so that each
        voice is safe.
      </p>
    </div>
  );
}
