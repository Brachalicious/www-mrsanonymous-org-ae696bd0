import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/women")({
  head: () => ({
    meta: [
      { title: "For women — MrsANONymous.org" },
      { name: "description", content: "Anonymous support, stories, and resources for women surviving domestic violence." },
      { property: "og:title", content: "For women — MrsANONymous.org" },
      { property: "og:description", content: "Anonymous support, stories, and resources for women surviving domestic violence." },
    ],
  }),
  component: WomenPage,
});

function WomenPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">For women</h1>
      <p className="mt-6 text-ink-600">
        You are not alone. Whether you are still in the relationship, planning to leave, or rebuilding
        afterward, this section is for you.
      </p>
    </div>
  );
}
