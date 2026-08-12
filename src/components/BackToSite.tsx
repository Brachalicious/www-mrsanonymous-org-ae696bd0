import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function BackToSite() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return null;

  return (
    <Link
      to="/"
      aria-label="Go back to MrsANONymous home"
      className="fixed left-4 bottom-24 z-40 flex items-center gap-2 rounded-full border border-rose-200 bg-white/95 px-4 py-2 text-sm font-semibold text-ink-900 shadow-lg backdrop-blur transition hover:bg-rose-50 md:bottom-6"
    >
      <ArrowLeft className="h-4 w-4 text-rose-500" />
      <span>Back to MrsANONymous</span>
    </Link>
  );
}
