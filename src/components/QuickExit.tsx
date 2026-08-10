import { useEffect } from "react";

const QUICK_EXIT_URL = "https://www.google.com";

export function performQuickExit() {
  try {
    // Replace the current history entry with the safe URL so this app
    // does NOT remain in the browser's back/forward history.
    // If the abuser presses Back after exit, they will skip over the
    // site entirely and land on whatever page was visited before it.
    window.location.replace(QUICK_EXIT_URL);

    // Also try to open Google in a new tab so the current tab can be
    // closed without leaving a trail in this one.
    try {
      window.open(QUICK_EXIT_URL, "_blank", "noopener,noreferrer");
    } catch {
      // popup blocked; the replace above already handled the current tab
    }
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
