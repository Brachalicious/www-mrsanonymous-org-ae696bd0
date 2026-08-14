import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";

type Search = { url?: string };

export const Route = createFileRoute("/go")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    url: typeof search.url === "string" ? search.url : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Opening a resource — MrsANONymous.org" },
      { name: "description", content: "Opening an outside support resource inside MrsANONymous, so you can always come straight back." },
      { property: "og:title", content: "Opening a resource — MrsANONymous.org" },
      { property: "og:description", content: "Outside support resources open inside MrsANONymous with a one-tap way back." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GoPage,
});

function GoPage() {
  const { url } = Route.useSearch();
  const navigate = useNavigate();
  const [blocked, setBlocked] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (!url) return;
    const t = window.setTimeout(() => {
      if (!loaded.current) setBlocked(true);
    }, 4000);
    return () => window.clearTimeout(t);
  }, [url]);

  if (!url) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-ink-600">No link was provided.</p>
      </div>
    );
  }

  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* keep raw */
  }

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 w-full bg-cream-100"
          : "relative h-[calc(100vh-3.5rem)] w-full bg-cream-100"
      }
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-900/10 bg-white/95 px-4 py-2 text-sm">
        <button
          type="button"
          onClick={() => navigate({ to: "/resources" })}
          className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-3 py-1.5 font-semibold text-ink-900 hover:bg-rose-50"
        >
          <ArrowLeft className="h-4 w-4 text-rose-500" />
          Back to MrsANONymous
        </button>
        <span className="truncate text-ink-500">{host}</span>
        <button
          type="button"
          onClick={() => setFullscreen((f) => !f)}
          className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-rose-600 underline underline-offset-4 hover:bg-rose-50"
        >
          <ExternalLink className="h-4 w-4" />
          {fullscreen ? "Exit full site" : "Open full site"}
        </button>
      </div>

      {blocked ? (
        <div className="mx-auto max-w-xl px-5 py-16 text-center">
          <h1 className="font-serif text-2xl text-ink-900">{host} can't be shown inside the app</h1>
          <p className="mt-3 text-sm text-ink-600">
            This organization blocks being displayed inside other sites. Opening it will replace this
            tab (no new tab, no extra history entry) — use your browser's back gesture or reopen
            MrsANONymous to return.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => window.location.replace(url)} className="btn-rose">
              Continue to {host}
            </button>
            <button type="button" onClick={() => navigate({ to: "/resources" })} className="btn-ghost">
              Back to MrsANONymous
            </button>
          </div>
        </div>
      ) : (
        <iframe
          src={url}
          title={host}
          onLoad={() => {
            loaded.current = true;
          }}
          className="h-[calc(100%-2.75rem)] w-full border-0"
          referrerPolicy="no-referrer"
        />
      )}

      {/* Always-visible way back, even in full-site view */}
      <button
        type="button"
        onClick={() => {
          setFullscreen(false);
          navigate({ to: "/resources" });
        }}
        aria-label="Go back to MrsANONymous"
        className="fixed left-4 bottom-6 z-[60] flex items-center gap-2 rounded-full border border-rose-200 bg-white/95 px-4 py-2 text-sm font-semibold text-ink-900 shadow-lg backdrop-blur transition hover:bg-rose-50"
      >
        <ArrowLeft className="h-4 w-4 text-rose-500" />
        <span>Back to MrsANONymous</span>
      </button>
    </div>
  );
}