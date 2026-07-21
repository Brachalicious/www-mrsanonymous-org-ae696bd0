import { createFileRoute } from "@tanstack/react-router";
import { ContactForm } from "@/components/ContactForm";

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
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-10">
      <div className="mb-8 text-center">
        <span className="hand-note text-2xl">we are listening</span>
        <h1 className="mt-2 font-serif text-4xl text-ink-900">Contact us</h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-600">
          If you have a question, feedback, or a safety concern, please reach out. You do not need to share your real name or email.
        </p>
      </div>
      <ContactForm audience="women" />
    </div>
  );
}
