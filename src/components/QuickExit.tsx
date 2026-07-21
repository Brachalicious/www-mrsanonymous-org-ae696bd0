import { useEffect } from "react";

const QUICK_EXIT_URL = "https://www.google.com";

export function performQuickExit() {
  try {
    window.location.replace(QUICK_EXIT_URL);
  } catch {
    window.location.href = QUICK_EXIT_URL;
  }
}

export function QuickExit() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        performQuickExit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}
