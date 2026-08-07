import { useEffect } from "react";

const QUICK_EXIT_URL = "https://www.google.com";

export function performQuickExit() {
  try {
    // Wipe same-origin history so Back can't return to the app.
    try {
      window.history.replaceState(null, "", window.location.href);
      for (let i = 0; i < 20; i++) {
        window.history.pushState(null, "", window.location.href);
      }
      // If the user does hit Back (to a pushed dummy entry), immediately
      // forward them to Google again.
      window.addEventListener("popstate", () => {
        window.location.replace(QUICK_EXIT_URL);
      });
    } catch {
      // ignore history errors
    }

    // Also try to open Google in a new tab so the current tab can be closed
    // by the user without leaving a trail in this one.
    try {
      window.open(QUICK_EXIT_URL, "_blank", "noopener,noreferrer");
    } catch {
      // popup blocked; that's fine, we still redirect below
    }

    // Replace current tab with Google (no new history entry created here).
    window.location.replace(QUICK_EXIT_URL);
  } catch {
    window.location.href = QUICK_EXIT_URL;
  }
}

export function QuickExit() {
  useEffect(() => {
    function isTyping(target: EventTarget | null) {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable === true
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        performQuickExit();
        return;
      }
      // "X" key also triggers quick exit (unless the user is typing)
      if (
        (e.key === "x" || e.key === "X") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isTyping(e.target)
      ) {
        e.preventDefault();
        performQuickExit();
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  return null;
}
