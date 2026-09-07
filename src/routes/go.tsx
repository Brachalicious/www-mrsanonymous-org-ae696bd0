import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Copy, ExternalLink, Maximize2, Minimize2, X } from "lucide-react";
import { readGoUrl } from "@/lib/go-link";
import { checkFramable } from "@/lib/frame-check.functions";

type Search = { url?: string; r?: string };

export const Route = createFileRoute("/go")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    url: typeof search.url === "string" ? search.url : undefined,
    r: typeof search.r === "string" ? search.r : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Opening a resource — MrsANONymous.org" },
      { name: "description", content: "Outside support resources open inside MrsANONymous with a one-tap way back." },
      { property: "og:title", content: "Opening a resource — MrsANONymous.org" },
      { property: "og:description", content: "Outside support resources open inside MrsANONymous with a one-tap way back." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GoPage,
});

function GoPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [url, setUrl] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  // null = not yet checked / unverifiable, true = site refuses framing,
  // false = server confirmed framing is allowed.
  const [frameBlocked, setFrameBlocked] = useState<boolean | null>(null);
  const frameBlockedRef = useRef<boolean | null>(null);
  const loaded = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setUrl(search.url ?? readGoUrl(search.r));
    setResolved(true);
  }, [search.url, search.r]);

  useEffect(() => {
    if (!url) return;
    loaded.current = false;
    setBlocked(false);
    setDismissed(false);
    setFrameBlocked(null);
    frameBlockedRef.current = null;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      // Many crisis sites block framing for safety — and browsers still fire
      // the iframe load event for the blank blocked page, so a client-side
      // load signal alone can never be trusted. If the server check has not
      // positively confirmed framing, offer the fallback after a short wait
      // so the user is never stuck on a blank screen.
      setBlocked(true);
    }, 2500);

    // Ask the server to read the site's framing headers (impossible from the
    // client due to CORS). A confirmed "blocked" shows the fallback instantly.
    let cancelled = false;
    checkFramable({ data: { url } })
      .then((res) => {
        if (cancelled) return;
        setFrameBlocked(res.blocked);
        frameBlockedRef.current = res.blocked;
        if (res.blocked === true) {
          if (timer.current) window.clearTimeout(timer.current);
          timer.current = null;
          setBlocked(true);
        } else if (loaded.current && timer.current) {
          // Iframe already loaded before the check came back. When the check
          // is unverifiable (null) we cannot prove the site allows framing,
          // but it also never confirmed blocking — trust the real render over
          // showing a false "can't be shown" warning on a working page.
          window.clearTimeout(timer.current);
          timer.current = null;
        }
      })
      .catch(() => {
        /* leave as unverifiable — timer fallback stays in charge */
      });

    return () => {
      cancelled = true;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [url]);

  const backButton = (
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
  );

  if (resolved && !url) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <p className="text-ink-600">That link is no longer available. Please pick it again from Resources.</p>
        {backButton}
      </div>
    );
  }

  if (!url) return null;

  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* keep raw */
  }

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function openSafely() {
    if (!url) return;
    // Open the resource in a new tab and replace this tab with a neutral
    // search page so the crisis site never appears in this tab's history.
    // If the pop-up is blocked, take this tab to the resource instead so the
    // user always reaches help.
    let win: Window | null = null;
    try {
      win = window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      win = null;
    }
    if (win) {
      window.location.replace("https://www.google.com/search?q=weather");
    } else {
      window.location.assign(url);
    }
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
          onClick={() => {
            setFullscreen(false);
            navigate({ to: "/resources" });
          }}
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
          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          {fullscreen ? "Exit full screen" : "Full screen"}
        </button>
      </div>

      {blocked && !dismissed && (
        <div className="absolute inset-x-0 top-11 z-40 mx-auto max-w-xl p-4">
          <div className="relative rounded-2xl border border-rose-200 bg-white/98 p-6 text-center shadow-2xl backdrop-blur">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="absolute right-3 top-3 rounded-full p-1 text-ink-400 hover:bg-rose-50 hover:text-ink-600"
              aria-label="Hide notice"
            >
              <X className="h-4 w-4" />
            </button>
            <h1 className="font-serif text-2xl text-ink-900">{host} can&apos;t be shown inside the app</h1>
            <p className="mt-3 text-sm text-ink-600">
              This organization blocks being displayed inside other sites. To keep you safe,
              MrsANONymous stays open and your address bar keeps showing this site only.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={openSafely}
                className="btn-rose inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in new tab
              </button>
              <button type="button" onClick={copyLink} className="btn-ghost inline-flex items-center gap-2">
                <Copy className="h-4 w-4" />
                {copied ? "Link copied" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: "/resources" })}
                className="btn-ghost inline-flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to MrsANONymous
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-500">
              You can paste the copied link into a private/incognito window when it&apos;s safe.
            </p>
          </div>
        </div>
      )}

      {frameBlocked !== true && (
        <iframe
          src={url}
          title={host}
          onLoad={() => {
            loaded.current = true;
            // A load event alone is not proof of a visible page — blocked
            // sites fire it too — but the server check already catches
            // confirmed blockers instantly (frameBlocked === true hides the
            // iframe outright). When the check is unverifiable (null), the
            // server could not prove blocking either, so prefer trusting the
            // rendered page: a false "can't be shown" warning over a working
            // crisis chat is the worse failure. (Ref, not state — this
            // handler can fire before the server check resolves.)
            if (frameBlockedRef.current !== true && timer.current) {
              window.clearTimeout(timer.current);
              timer.current = null;
            }
          }}
          className="h-[calc(100%-2.75rem)] w-full border-0"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-forms allow-same-origin"
        />
      )}

      {backButton}
    </div>
  );
}

