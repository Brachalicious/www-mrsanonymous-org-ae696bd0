import { Link } from "@tanstack/react-router";

interface PrivateLetterProps {
  showAboutLink?: boolean;
}

export function PrivateLetter({ showAboutLink = true }: PrivateLetterProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative rounded-[2rem] border-2 border-ink-900 bg-white p-8 shadow-[8px_8px_0px_rgba(196,139,129,0.22)] sm:p-10">
        <div className="absolute -top-4 left-8 inline-flex items-center rounded-full bg-rose-500 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
          Private Letter
        </div>

        <div className="font-hand text-2xl text-rose-500">to whoever needs this —</div>

        <p className="mt-5 font-serif text-2xl leading-snug text-ink-900 sm:text-[1.75rem]">
          “Whether you are here to tell your story, read others, or simply feel less alone — this space is for you.”
        </p>

        <p className="mt-6 text-sm leading-relaxed text-ink-500">
          You choose what to share, how to share, and when to share.
        </p>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-xs text-ink-300">— Mrs. Anonymous</span>
          <span className="font-hand text-lg text-rose-400">xx</span>
        </div>
      </div>

      {showAboutLink && (
        <div className="mt-6 text-center">
          <Link
            to="/about"
            data-testid="home-cta-about"
            className="inline-flex items-center gap-1 text-sm font-semibold text-rose-500 underline underline-offset-4 transition hover:text-rose-600"
          >
            Read about who we are <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
