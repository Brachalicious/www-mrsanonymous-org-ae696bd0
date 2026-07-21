import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Safety tools — MrsANONymous.org" },
      { name: "description", content: "Quick exit, silent panic, and other safety tools for private browsing." },
      { property: "og:title", content: "Safety tools — MrsANONymous.org" },
      { property: "og:description", content: "Quick exit, silent panic, and other safety tools for private browsing." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">Tools</h1>
      <p className="mt-6 text-ink-600">
        Safety-first tools to help you browse privately and leave quickly when you need to.
      </p>
    </div>
  );
}
