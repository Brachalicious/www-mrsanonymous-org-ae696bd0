import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MrsANONymous.org" },
      { name: "description", content: "Reach out to MrsANONymous.org. We do not require your name or email." },
      { property: "og:title", content: "Contact — MrsANONymous.org" },
      { property: "og:description", content: "Reach out to MrsANONymous.org. We do not require your name or email." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">Contact us</h1>
      <p className="mt-6 text-ink-600">
        We are here to listen. If you have a question, feedback, or a safety concern, please reach out. You do not
        need to share your real name or email.
      </p>
    </div>
  );
}
