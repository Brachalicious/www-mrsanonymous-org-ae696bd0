import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — MrsANONymous.org" },
      { name: "description", content: "Learn about MrsANONymous.org, a safe and anonymous space for women and girls to share, heal, and find support." },
      { property: "og:title", content: "About us — MrsANONymous.org" },
      { property: "og:description", content: "Learn about MrsANONymous.org, a safe and anonymous space for women and girls." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">About us</h1>
      <p className="mt-6 text-ink-600">
        MrsANONymous.org is a warm, anonymous space for women and girls who are experiencing, or have
        experienced, domestic violence. We believe safety and privacy are non-negotiable, and that telling your
        story — even without a name — can be a powerful step toward healing.
      </p>
    </div>
  );
}
