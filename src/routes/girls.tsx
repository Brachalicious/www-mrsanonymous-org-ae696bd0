import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/girls")({
  head: () => ({
    meta: [
      { title: "For girls — MrsANONymous.org" },
      { name: "description", content: "A safe corner for girls and young women to find support, tools, and hope without sharing their identity." },
      { property: "og:title", content: "For girls — MrsANONymous.org" },
      { property: "og:description", content: "A safe corner for girls and young women to find support without sharing their identity." },
    ],
  }),
  component: GirlsPage,
});

function GirlsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">For girls</h1>
      <p className="mt-6 text-ink-600">
        If something feels wrong in your home or relationship, your feelings are real. This is a safe place to
        learn, write, and be heard without anyone knowing who you are.
      </p>
    </div>
  );
}
