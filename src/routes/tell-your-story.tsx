import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

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
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">Tell Your Story</h1>
      <p className="mt-6 text-ink-600">
        This is your private space. Write what you need to write, keep it safe, and decide if you want to share it
        with the community board.
      </p>
    </div>
  );
}
