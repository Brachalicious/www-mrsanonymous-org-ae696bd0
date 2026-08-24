import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Shield, ShieldCheck, X, ChevronDown, ChevronUp, Info } from "lucide-react";
import { stashGoUrl } from "@/lib/go-link";

const STORAGE_KEY = "mrsanon:hide-history";
const DISMISS_KEY = "mrsanon:hide-history-dismissed";
export const HIDE_HISTORY_CHANGE_EVENT = "mrsanon:hide-history-change";

export function isHideHistoryEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

export function setHideHistoryEnabled(next: boolean) {
  if (next) window.localStorage.setItem(STORAGE_KEY, "1");
  else window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(HIDE_HISTORY_CHANGE_EVENT, { detail: next }));
}

export function reopenPrivacyBanner() {
  window.localStorage.removeItem(DISMISS_KEY);
  window.dispatchEvent(new CustomEvent(HIDE_HISTORY_CHANGE_EVENT, { detail: isHideHistoryEnabled() }));
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

  useEffect(() => {
    function sync(e: Event) {
      setEnabled(!!(e as CustomEvent<boolean>).detail);
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    }
    window.addEventListener(HIDE_HISTORY_CHANGE_EVENT, sync);
    return () => window.removeEventListener(HIDE_HISTORY_CHANGE_EVENT, sync);
  }, []);

  // When enabled, every web link stays in this tab and replaces the current
  // history entry instead of adding to it, so the back button reveals nothing.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor || anchor.hasAttribute("download") || anchor.getAttribute("data-bypass-go")) return;
      const href = anchor.getAttribute("href");
      if (!href) return;

      const destination = new URL(href, window.location.href);
      if (destination.protocol !== "http:" && destination.protocol !== "https:") return;

      const hideHistory = isHideHistoryEnabled();

      e.preventDefault();
      e.stopPropagation();

      if (destination.origin === window.location.origin) {
        void router.navigate({
          to: `${destination.pathname}${destination.search}${destination.hash}`,
          replace: hideHistory,
        });
        return;
      }

      // Keep every outside resource inside the protected viewer so the address bar
      // remains on MrsANONymous and the persistent back button stays available.
      void router.navigate({
        to: "/go",
        search: { r: stashGoUrl(destination.href) },
        replace: hideHistory,
      });
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
    };
  }, [router]);

  if (!ready || (dismissed && !enabled)) return null;

  function enable() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setEnabled(true);
    window.dispatchEvent(new CustomEvent(HIDE_HISTORY_CHANGE_EVENT, { detail: true }));
  }

  function disable() {
    window.localStorage.removeItem(STORAGE_KEY);
    setEnabled(false);
    window.dispatchEvent(new CustomEvent(HIDE_HISTORY_CHANGE_EVENT, { detail: false }));
  }

  function dismiss() {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  return (
    <div className="border-b border-ink-900/10 bg-ink-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 text-sm">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
          {enabled ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          ) : (
            <Shield className="h-4 w-4 text-white/70" />
          )}
        </span>

        <p className="flex-1 leading-snug">
          <span className="font-semibold">{enabled ? "Privacy mode is on" : "Hide your history"}</span>
          <span className="ml-1 hidden text-white/70 sm:inline">
            {enabled
              ? "— pages you open here won't be added to your browser history."
              : "— pages you open here won't be added to your browser history."}
          </span>
        </p>

        <div className="flex shrink-0 items-center gap-1">
          {enabled ? (
            <button
              onClick={disable}
              className="inline-flex items-center gap-1 rounded-full border border-white/30 px-3 py-1 text-xs font-medium hover:bg-white/10"
            >
              <X className="h-3 w-3" />
              Turn off
            </button>
          ) : (
            <button
              onClick={enable}
              className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
            >
              <ShieldCheck className="h-3 w-3" />
              Enable
            </button>
          )}
          <button
            onClick={dismiss}
            className="rounded-full px-3 py-1 text-xs font-medium text-white/80 hover:bg-white/10"
          >
            Dismiss
          </button>
          <button
            onClick={() => setShowLearnMore((v) => !v)}
            className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium text-white/70 hover:text-white"
            aria-expanded={showLearnMore}
          >
            <Info className="h-3 w-3" />
            <span className="hidden sm:inline">Learn more</span>
            {showLearnMore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {showLearnMore && (
        <div className="border-t border-white/10 bg-ink-800/50">
          <div className="mx-auto max-w-7xl px-4 py-3 text-sm leading-relaxed text-white/85">
            <p className="mb-2">
              Enabling this keeps MrsANONymous from adding new entries to your browser's back button
              while you browse. Pressing <strong>X</strong> or <strong>Esc</strong> instantly leaves for
              Google and removes this site from the current history entry.
            </p>
            <p className="mb-1 font-semibold text-white">To fully clear traces on this device:</p>
            <ul className="grid list-disc gap-1 pl-5 sm:grid-cols-2">
              <li><strong>Chrome / Edge:</strong> Ctrl+Shift+Del → clear browsing history.</li>
              <li><strong>Safari (Mac):</strong> History → Clear History.</li>
              <li><strong>Safari (iPhone):</strong> Settings → Safari → Clear History and Website Data.</li>
              <li><strong>Firefox:</strong> Ctrl+Shift+Del → Browsing &amp; Download History.</li>
            </ul>
            <p className="mt-2 text-xs text-white/60">
              Safest: use a private/incognito window, or a device your abuser can't access. Clearing all history
              can look suspicious if your browsing is monitored — deleting only this site's entries may be safer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
