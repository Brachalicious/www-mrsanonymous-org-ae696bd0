import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, profile } = useAuth();

  return (
    <div className="paper-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-12 lg:px-10 lg:py-28">
          <div className="animate-fade-in-up lg:col-span-7">
            <span className="hand-note text-3xl">a safe place to speak</span>
            <h1 className="mt-4 text-5xl leading-[1.05] tracking-tight text-ink-900 sm:text-6xl lg:text-[5.25rem]">
              A safe &amp; <span className="italic text-rose-500">100%&nbsp;anonymous</span> space
              <br />
              for women and <span className="underline decoration-rose-400/60 decoration-4 underline-offset-8">girls</span>.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-700">
              Tell your story — without fear of exposure, judgment, or retaliation.
              Find resources, get help, and know that you are not alone.
            </p>
            <p className="mt-3 max-w-xl font-serif text-xl italic text-ink-700">
              Your safety. Your voice. Your control.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/tell-your-story" data-testid="home-cta-tell-story" className="btn-rose">
                Tell Your Story
              </Link>
              <a href="#contact" data-testid="home-cta-contact" className="btn-ghost">
                Contact Us Anonymously
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-ink-500">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> No real name needed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> No identifying info stored
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-900/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Quick Exit always one click away
              </span>
            </div>
          </div>

          {/* Envelope card */}
          <div className="lg:col-span-5">
            <div className="envelope-shadow relative mx-auto max-w-md rotate-1 rounded-3xl border-2 border-ink-900 bg-white p-8 sm:p-10">
              <div className="absolute -top-4 left-8 rounded-full bg-rose-500 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                Private Letter
              </div>
              <div className="font-hand text-2xl text-rose-500">to whoever needs this —</div>
              <p className="mt-4 font-serif text-2xl leading-snug text-ink-900">
                "Whether you are here to tell your story, read others, or simply feel less alone — this space is for you."
              </p>
              <p className="mt-6 text-sm leading-relaxed text-ink-500">
                You choose what to share, how to share, and when to share.
              </p>
              <div className="mt-8 flex items-center justify-between text-xs text-ink-300">
                <span>— Mrs. Anonymous</span>
                <span className="font-hand text-lg text-rose-400">xx</span>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-ink-500">
              <Link to="/about" data-testid="home-cta-about" className="link-soft underline-offset-4 hover:underline">
                Read about who we are →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Hand Signal */}
      <HandSignalSection />

      {/* Quick paths */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
        <div className="grid gap-5 md:grid-cols-3">
          <PathCard
            testid="path-card-women"
            eyebrow="Women"
            title="A space for women"
            body="Send an anonymous message, read resources written for adult women, or reach a hotline if you need urgent help."
            to="/women"
          />
          <PathCard
            testid="path-card-girls"
            eyebrow="Girls"
            title="A space for girls"
            body="If you're a girl or teen, you matter and we hear you. Reach out anonymously — we listen without judgment."
            to="/girls"
          />
          <PathCard
            testid="path-card-story"
            eyebrow="Tell Your Story"
            title="Your private notebooks"
            body="Create an anonymous nickname account and keep private notebooks only you can read. Write what you can't yet say out loud."
            to={user ? "/tell-your-story?tab=mine" : "/tell-your-story"}
          />
        </div>
      </section>

      {/* Embedded Contact form */}
      <ContactSection />

      {/* Bottom band */}
      <section className="border-y-2 border-ink-900 bg-ink-900 py-14 text-white">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-10">
          <h2 className="font-serif text-3xl sm:text-4xl">
            You are <em className="text-rose-400">not alone.</em>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            If you are struggling, there are resources available to help guide you toward real
            support when you're ready.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/resources"
              data-testid="home-resources"
              className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-ink-900"
            >
              Resources
            </Link>
            <a
              href="https://www.thehotline.org/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="home-help-women"
              className="btn-rose"
            >
              Get Help Now (Women)
            </a>
            <a
              href="https://childhelphotline.org/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="home-help-girls"
              className="rounded-full border border-white/40 bg-white px-6 py-3 text-sm font-semibold text-ink-900 hover:bg-white/90"
            >
              Get Help Now (Girls)
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function PathCard({
  eyebrow,
  title,
  body,
  to,
  testid,
}: {
  eyebrow: string;
  title: string;
  body: string;
  to: string;
  testid: string;
}) {
  const isExternal = to.startsWith("http");
  if (isExternal) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={testid}
        className="note-card group block p-7"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500">{eyebrow}</div>
        <h3 className="mt-2 font-serif text-2xl text-ink-900">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">{body}</p>
        <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-rose-500 transition-transform group-hover:translate-x-1">
          Continue <span aria-hidden>→</span>
        </div>
      </a>
    );
  }

  return (
    <Link
      to={to as any}
      data-testid={testid}
      className="note-card group block p-7"
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500">{eyebrow}</div>
      <h3 className="mt-2 font-serif text-2xl text-ink-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">{body}</p>
      <div className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-rose-500 transition-transform group-hover:translate-x-1">
        Continue <span aria-hidden>→</span>
      </div>
    </Link>
  );
}

function HandSignalSection() {
  return (
    <section data-testid="hand-signal-section" className="border-y-2 border-ink-900 bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-10">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-rose-500">The Hand Signal</div>
          <h2 className="mt-3 font-serif text-5xl leading-tight text-ink-900 sm:text-6xl">
            Call for <span className="italic text-rose-500">Help</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-700">
            The Silent Help Signal is a one-handed gesture you can use on a video call, through
            a window, or in person to silently signal to someone that you need help —
            without saying a word.
          </p>
          <ol className="mt-8 space-y-3 text-ink-900">
            <li className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-500 text-sm font-bold text-white">1</span>
              <span>Palm to camera and tuck your thumb across your palm.</span>
            </li>
            <li className="flex gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-500 text-sm font-bold text-white">2</span>
              <span>Trap your thumb by closing your fingers down over it.</span>
            </li>
          </ol>
          <p className="mt-7 max-w-md text-sm text-ink-500">
            If you see someone make this signal, ask them in a safe, indirect way how you can
            help — or contact authorities for them.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <img
            src="/hand-signal.jpg"
            alt="Silent Help Signal — Step 1: palm to camera and tuck thumb. Step 2: trap thumb by closing fingers over it."
            data-testid="hand-signal-illustration"
            className="w-full max-w-md rounded-2xl border-[3px] border-black shadow-[8px_8px_0px_#ff0000]"
          />
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!message.trim()) {
      setStatus("Please write a message before sending.");
      return;
    }
    setSending(true);
    setStatus("");
    try {
      // TODO: wire to a server function when backend is ready
      await new Promise((res) => setTimeout(res, 800));
      setStatus("✓ Message received. Thank you for trusting us with it.");
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" data-testid="home-contact-section" className="scroll-mt-24 bg-white pb-24">
      <div
        data-testid="home-contact-card"
        className="mx-auto max-w-[600px] rounded-2xl bg-ink-900 p-7 text-center text-white shadow-[0_0_25px_rgba(196,139,129,0.2)]"
      >
        <h2 className="text-[1.7rem] text-rose-400">Contact Us Anonymously</h2>

        <p className="mt-3 text-[13px] leading-relaxed text-rose-400">
          You can send a message without an account. Create a completely anonymous account
          only if you would like to receive a reply to messages sent or to save/edit your
          input data and uploaded content.
        </p>

        <p className="mt-3 text-xs leading-relaxed text-ink-300">
          DO NOT USE YOUR REAL NAME! choose a nickname that is NONE IDENTIFIABLE and easy
          for you to remember. To ensure your anonymity and safety Do NOT share your
          nickname with anyone.
        </p>

        <textarea
          data-testid="home-contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your message..."
          className="mt-5 w-full rounded-lg border-none bg-ink-700 p-3.5 text-sm text-white placeholder:text-ink-400 focus:outline-none"
          style={{ minHeight: "120px", resize: "none" }}
        />

        <button
          type="button"
          data-testid="home-contact-send"
          onClick={send}
          disabled={sending}
          className="mt-4 w-full rounded-lg bg-emergency px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send Message"}
        </button>

        <Link
          to={user ? "/tell-your-story" : "/signup"}
          data-testid="home-contact-create-account"
          className="mt-3 block w-full rounded-lg bg-rose-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Create Anonymous Account (Optional)
        </Link>

        {status && (
          <p
            data-testid="home-contact-status"
            className={`mt-3 text-xs ${status.startsWith("✓") ? "text-emergency" : "text-rose-400"}`}
          >
            {status}
          </p>
        )}
      </div>
    </section>
  );
}
