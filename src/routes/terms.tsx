import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — MrsANONymous" },
      { name: "description", content: "Community rules, zero tolerance for abusive content, and the terms that apply when you use MrsANONymous." },
      { property: "og:title", content: "Terms of Use — MrsANONymous" },
      { property: "og:description", content: "Community rules and zero tolerance for abusive content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">Terms of Use</h1>
      <p className="mt-2 text-sm text-ink-500">
        This agreement applies to everyone who posts or reads stories here.
      </p>

      <Section title="Not an emergency service">
        MrsANONymous does not provide emergency response, medical care, legal advice, or counseling. In
        danger, contact your local emergency number immediately.
      </Section>

      <Section title="Zero tolerance for objectionable content">
        There is no tolerance for abusive, hateful, harassing, or sexually exploitative content, threats,
        doxxing, or content that identifies a survivor or a child. Accounts that post it are removed.
      </Section>

      <Section title="What we do about it">
        <ul className="ml-5 list-disc space-y-1">
          <li>Every shared story can be reported with one tap.</li>
          <li>Reported content is reviewed and removed if it breaks these rules, normally within 24 hours.</li>
          <li>Stories reported by multiple readers are hidden automatically pending review.</li>
          <li>You can block a storyteller so you never see their posts again.</li>
          <li>We eject users who post objectionable content or abuse other people here.</li>
        </ul>
      </Section>

      <Section title="Your responsibilities">
        <ul className="ml-5 list-disc space-y-1">
          <li>Do not post identifying details about yourself or anyone else.</li>
          <li>Do not use this space to threaten, stalk, or locate another person.</li>
          <li>You own what you write; by sharing a story you allow us to display it anonymously.</li>
        </ul>
      </Section>

      <Section title="Your account">
        Accounts are nickname-only. If you lose your password and your security answers, we cannot
        recover your account — we hold nothing that could identify you. You may delete your account at
        any time from Settings.
      </Section>

      <Section title="No warranty">
        The service is provided "as is", without warranties of any kind. To the fullest extent permitted
        by law, we are not liable for damages arising from your use of the service.
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-2xl text-ink-900">{title}</h2>
      <div className="mt-2 space-y-2 text-ink-700 leading-relaxed">{children}</div>
    </section>
  );
}
