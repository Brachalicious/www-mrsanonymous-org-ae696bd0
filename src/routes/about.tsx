import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — MrsAnonymous" },
      { name: "description", content: "MrsAnonymous is an anonymous support platform for women and girls experiencing domestic violence." },
      { property: "og:title", content: "About Us — MrsAnonymous" },
      { property: "og:description", content: "Learn about MrsAnonymous and our commitment to safety, anonymity, and voice." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <article className="paper-bg">
      <div className="mx-auto max-w-3xl px-5 py-20 lg:px-10">
        <span className="hand-note text-2xl">about us</span>
        <h1 className="mt-3 font-serif text-5xl leading-tight text-ink-900 sm:text-6xl">
          About <span className="italic text-rose-500">Us</span>
        </h1>

        <div className="mt-10 space-y-7 text-lg leading-relaxed text-ink-700">
          <p className="font-serif text-2xl italic text-ink-900">Mrs. Anonymous is not one woman.</p>

          <p>She is every woman and girl who has ever needed a safe place to speak — but couldn't.</p>

          <p>
            This space was created for those who feel unheard, silenced, or afraid to share their truth. Here, you can
            express yourself freely — without fear of exposure, judgment, or retaliation.
          </p>

          <div>
            <p>Everything here is built around one purpose:</p>
            <p className="mt-2 font-serif text-2xl font-semibold text-ink-900">your safety, your voice, and your control.</p>
          </div>

          <ul className="space-y-1 border-l-2 border-rose-300 pl-5 font-serif text-xl text-ink-900">
            <li>You choose what to share, how to share, and when to share.</li>
          </ul>

          <p>
            Whether you are here to tell your story, read others, or simply feel less alone — this space is for you.
          </p>

          <p>
            If you are struggling, there are resources available to help guide you toward real support when you're ready.
          </p>

          <p className="font-serif text-2xl text-ink-900">You are not alone.</p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/tell-your-story" data-testid="about-cta-story" className="btn-rose">
            Tell Your Story
          </Link>
          <Link to="/resources" data-testid="about-cta-resources" className="btn-ghost">
            See Resources
          </Link>
        </div>
      </div>
    </article>
  );
}
