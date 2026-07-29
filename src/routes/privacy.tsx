import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — MrsANONymous" },
      { name: "description", content: "How MrsANONymous collects, uses, and protects your information. No email required, no tracking, no selling of data." },
      { property: "og:title", content: "Privacy Policy — MrsANONymous" },
      { property: "og:description", content: "No email required, no tracking, no selling of data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-500">Last updated: {new Date().getFullYear()}</p>

      <Section title="Who we are">
        MrsANONymous.org is a free safety and support service for women and girls experiencing or
        surviving domestic violence. We are not an emergency service.
      </Section>

      <Section title="What we collect">
        <ul className="ml-5 list-disc space-y-1">
          <li><strong>A nickname and password.</strong> We never ask for your email, phone number, or real name.</li>
          <li><strong>Security question answers</strong>, stored only as one-way hashes so we cannot read them.</li>
          <li><strong>Anything you write</strong> in your notebooks or send to support.</li>
          <li><strong>An anonymous session identifier</strong> in a cookie, used to remember your reactions and blocks.</li>
        </ul>
      </Section>

      <Section title="What we never collect">
        <ul className="ml-5 list-disc space-y-1">
          <li>Your location is never sent to us. If you use the emergency location feature, your device shares it directly with the emergency service you contact.</li>
          <li>No advertising identifiers, no third-party ad networks, no analytics profiles, no data brokers.</li>
          <li>We never sell or rent any information about you.</li>
        </ul>
      </Section>

      <Section title="How your writing is used">
        Notebooks are private by default. A notebook appears on the community board only if you choose to
        share it, and you decide whether it shows your nickname or "Anonymous". You can unshare or delete
        it at any time.
      </Section>

      <Section title="Translation">
        If you switch languages, the text on screen may be sent to Google Translate to be translated.
        Do not rely on translation for anything you consider secret.
      </Section>

      <Section title="Deleting your account">
        You can permanently delete your account and everything in it at any time from{" "}
        <a href="/settings" className="text-rose-600 underline">Settings</a>. Deletion is immediate and
        cannot be undone.
      </Section>

      <Section title="Children">
        Our "Girls" section is written for teens. We do not knowingly collect personal information from
        children, and we require no personal information from anyone.
      </Section>

      <Section title="Contact">
        Questions about privacy? Use the contact form anywhere on the site — replies come back to your
        in-app inbox, no email needed.
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
