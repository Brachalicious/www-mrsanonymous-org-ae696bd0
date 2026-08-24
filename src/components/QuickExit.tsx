import { useEffect } from "react";

const QUICK_EXIT_URL = "https://www.google.com";

export function performQuickExit() {
  // Replace the current history entry with the safe URL so this app
  // does NOT remain in the browser's back/forward history. The exit must
  // always stay in the current tab and never create a new tab or entry.
  window.location.replace(QUICK_EXIT_URL);
}

export function performQuickExitFallback() {
  // If Google is blocked by the network, fall back to a blank page so the
  // back button still cannot return to MrsANONymous.
  window.location.replace("about:blank");
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
