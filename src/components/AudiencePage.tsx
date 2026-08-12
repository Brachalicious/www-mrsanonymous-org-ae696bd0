import { Link } from "@tanstack/react-router";
import { ContactForm } from "./ContactForm";

interface AudiencePageProps {
  audience: "women" | "girls";
}

export function AudiencePage({ audience }: AudiencePageProps) {
  const isGirls = audience === "girls";

  const config = isGirls
    ? {
        eyebrow: "for girls & teens",
        title: "Girls",
        subtitle: "We see you. We hear you. We believe you.",
        intro:
          "If you are a girl or teen, this space is built around your safety. No one needs to know you're here. No one needs to know what you write. Reach out only when, and only how, you want to.",
        promises: [
          "Your story will never be shared with a parent, school, or anyone else.",
          "We do not collect emails, phone numbers, or real names.",
          "If you ever feel unsafe right now, the help below is one tap away.",
        ],
        hotlines: [
          { name: "Emergency", phone: "911", href: "tel:911" },
          { name: "Childhelp National Child Abuse Hotline", phone: "1-800-422-4453", href: "tel:18004224453" },
          { name: "Loveisrespect (dating abuse, teens)", phone: "Text LOVEIS to 22522", href: "sms:22522?body=LOVEIS" },
          { name: "Crisis Text Line", phone: "Text HOME to 741741", href: "sms:741741?body=HOME" },
          { name: "Suicide & Crisis Lifeline", phone: "988 (call or text)", href: "tel:988" },
        ],
      }
    : {
        eyebrow: "for women",
        title: "Women",
        subtitle: "A place to be heard, on your terms.",
        intro:
          "Welcome to our dedicated space for women. We aim to provide resources and support to help you thrive in every aspect of your life.",
        promises: [
          "We do not store names, emails, or phone numbers.",
          "Anything you write stays in your private notebook unless YOU choose to share it.",
          "You can leave this site in one click — press ESC or tap ✕ Quick Exit.",
        ],
        hotlines: [
          { name: "Emergency", phone: "911", href: "tel:911" },
          { name: "National Domestic Violence Hotline", phone: "1-800-799-SAFE (7233)", href: "tel:18007997233" },
          { name: "RAINN (Sexual Assault Hotline)", phone: "1-800-656-HOPE (4673)", href: "tel:18006564673" },
          { name: "Crisis Text Line", phone: "Text HOME to 741741", href: "sms:741741?body=HOME" },
          { name: "Suicide & Crisis Lifeline", phone: "988 (call or text)", href: "tel:988" },
        ],
      };

  return (
    <div className="paper-bg">
      <div className="mx-auto max-w-4xl px-5 py-16 lg:px-10">
        <span className="hand-note text-2xl">{config.eyebrow}</span>
        <h1 className="mt-2 font-serif text-5xl text-ink-900 sm:text-6xl">{config.title}</h1>
        <p className="mt-4 font-serif text-2xl italic text-rose-500">{config.subtitle}</p>

        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-700">{config.intro}</p>

        {/* What we promise */}
        <section className="mt-12">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-rose-500">Our promises to you</div>
          <ul className="mt-4 space-y-3 text-ink-900">
            {config.promises.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Hotlines */}
        <section className="mt-12">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-rose-500">Help if you need it now</div>
          <ul data-testid={`audience-hotlines-${audience}`} className="mt-4 space-y-3">
            {config.hotlines.map((h) => (
              <li key={h.name}>
                <a
                  href={h.href}
                  className="note-card flex items-center justify-between px-5 py-4 transition hover:-translate-y-0.5 hover:border-rose-500"
                >
                  <span className="text-sm font-semibold text-ink-900">{h.name}</span>
                  <span className="text-sm font-bold text-rose-500">{h.phone}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <section className="mt-12 flex flex-wrap gap-3">
          <Link to="/tell-your-story" data-testid={`audience-cta-story-${audience}`} className="btn-rose">
            Tell Your Story
          </Link>
          <a
            href={isGirls ? "https://childhelphotline.org/" : "https://www.thehotline.org/"}

            rel="noopener noreferrer"
            data-testid={`audience-cta-help-${audience}`}
            className="btn-ghost"
          >
            Get Help Now
          </a>
          <a href={`#contact-${audience}`} data-testid={`audience-cta-contact-${audience}`} className="btn-ghost">
            Contact us anonymously
          </a>
        </section>

        {/* Anonymous contact form */}
        <section id={`contact-${audience}`} className="mt-16 scroll-mt-24">
          <ContactForm audience={audience} />
        </section>
      </div>
    </div>
  );
}
