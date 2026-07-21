import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — MrsANONymous.org" },
      { name: "description", content: "Crisis hotlines, local resources, and trusted information for women and girls in unsafe situations." },
      { property: "og:title", content: "Resources — MrsANONymous.org" },
      { property: "og:description", content: "Crisis hotlines, local resources, and trusted information for women and girls." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">Resources</h1>
      <p className="mt-6 text-ink-600">
        Trusted organizations, hotlines, and guides. If you are in danger, please contact a professional service or
        call emergency services.
      </p>
    </div>
  );
}
