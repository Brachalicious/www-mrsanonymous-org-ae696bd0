import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";

const STORAGE_KEY = "mrsanon:hide-history";
const DISMISS_KEY = "mrsanon:hide-history-dismissed";

export function isHideHistoryEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function PrivacyBanner() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(true);
  const [showLearnMore, setShowLearnMore] = useState(false);

  useEffect(() => {
    setEnabled(window.localStorage.getItem(STORAGE_KEY) === "1");
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    setReady(true);
  }, []);

  // When enabled, in-app navigation replaces the current history entry
  // instead of adding to it, so the back button reveals nothing.
  useEffect(() => {
    if (!enabled) return;

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || !href.startsWith("/") || (target && target !== "_self")) return;
      e.preventDefault();
      router.navigate({ href, replace: true });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [enabled, router]);

  if (!ready || (dismissed && !enabled)) return null;

  function enable() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setEnabled(true);
  }

  function disable() {
    window.localStorage.removeItem(STORAGE_KEY);
    setEnabled(false);
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="border-b border-ink-900/10 bg-ink-900 text-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 text-sm">
        <p className="flex-1 min-w-[240px]">
          <span className="font-semibold">For added privacy:</span>{" "}
          {enabled
            ? "History hiding is on — pages you open here won't stack up in your browser history."
            : "Hide your history."}
        </p>

        <div className="flex items-center gap-2">
          {enabled ? (
            <button onClick={disable} className="rounded-full border border-white/40 px-3 py-1 hover:bg-white/10">
              Turn off
            </button>
          ) : (
            <button onClick={enable} className="rounded-full bg-rose-500 px-3 py-1 font-semibold text-white hover:bg-rose-600">
              Enable
            </button>
          )}
          <button onClick={dismiss} className="rounded-full border border-white/40 px-3 py-1 hover:bg-white/10">
            Dismiss
          </button>
          <button
            onClick={() => setShowLearnMore((v) => !v)}
            className="rounded-full px-3 py-1 underline underline-offset-4 hover:bg-white/10"
          >
            Learn More
          </button>
        </div>
      </div>

      {showLearnMore && (
        <div className="mx-auto max-w-5xl px-4 pb-4 text-sm leading-relaxed text-white/90">

          <p className="mb-2">
            Enabling this keeps MrsANONymous from adding new entries to your browser's back button
            while you browse. Pressing <strong>X</strong> or <strong>Esc</strong> instantly leaves for
            Google and removes this site from the current history entry.
          </p>
          <p className="mb-2 font-semibold">To fully clear traces on this device:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li><strong>Chrome / Edge:</strong> Ctrl+Shift+Del (Cmd+Shift+Del on Mac) → clear browsing history.</li>
            <li><strong>Safari (Mac):</strong> History → Clear History. <strong>iPhone:</strong> Settings → Safari → Clear History and Website Data.</li>
            <li><strong>Firefox:</strong> Ctrl+Shift+Del → Browsing &amp; Download History.</li>
            <li><strong>Safest:</strong> use a private/incognito window, or a device your abuser can't access (library, friend, advocate).</li>
          </ul>
          <p className="mt-2">
            Note: clearing all history can look suspicious if your browsing is monitored. Deleting only
            this site's entries may be safer.
          </p>
        </div>
      )}
    </div>
  );
}
