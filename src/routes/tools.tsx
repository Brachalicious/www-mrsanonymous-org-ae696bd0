import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { performQuickExit } from "@/components/QuickExit";
import { AlertTriangle, ChevronDown, BookOpen, EyeOff, FileText, Hand, HeartPulse, MousePointer2, MoveDown, Pencil, Users } from "lucide-react";

export const Route = createFileRoute("/tools")({

  head: () => ({
    meta: [
      { title: "Safety tools — MrsANONymous.org" },
      { name: "description", content: "Quick exit, silent panic, and other safety tools for private browsing." },
      { property: "og:title", content: "Safety tools — MrsANONymous.org" },
      { property: "og:description", content: "Quick exit, silent panic, and other safety tools for private browsing." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  const [sofy, setSofy] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-10">
      <div className="mb-10 text-center">
        <span className="hand-note text-2xl">safety first</span>
        <h1 className="mt-2 font-serif text-4xl text-ink-900">Safety tools</h1>
        <p className="mx-auto mt-4 max-w-2xl text-ink-600">
          Tools to help you leave quickly, browse privately, and reach support without drawing attention.
        </p>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-3">
        <ToolCard
          icon={<AlertTriangle className="h-6 w-6 text-white" />}
          title="Quick Exit"
          color="bg-emergency"
          summary="Press ESC or the X key, or click any Quick Exit button, to swap this tab to Google."
        >
          <button onClick={performQuickExit} className="btn-emergency w-full">
            Try Quick Exit
          </button>
          <p className="mt-3 text-xs text-ink-500">
            Tip: Use your keyboard's ESC or X key anywhere on the site. It works even when you do not see a button.
          </p>
        </ToolCard>

        <ToolCard
          icon={<EyeOff className="h-6 w-6 text-ink-900" />}
          title="SOFY mode"
          color="bg-cream-200"
          summary="SOFY = See Only Friendly things from You. Hides sensitive story content with a calming mask."
        >
          <button
            onClick={() => setSofy((v) => !v)}
            className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition ${
              sofy ? "bg-ink-900 text-white" : "border border-ink-300 bg-white text-ink-900 hover:bg-cream-100"
            }`}
          >
            {sofy ? "SOFY mode is ON" : "Turn SOFY mode ON"}
          </button>
          {sofy && (
            <div className="mt-3 rounded-xl border border-ink-300 bg-white p-3 text-sm text-ink-600">
              Sensitive board cards are now masked. Tap a card to reveal only when you feel ready.
            </div>
          )}
        </ToolCard>

        <ToolCard
          icon={<Hand className="h-6 w-6 text-rose-600" />}
          title="Silent Panic"
          color="bg-rose-100"
          summary="A silent way to signal distress. Tap the help hand signal button in the bottom-right corner of any page."
        >
          <div className="flex flex-col items-center gap-2 py-2">
            <p className="text-sm font-semibold text-ink-900">
              Tap the help hand signal button for immediate help options
            </p>
            <MoveDown className="h-6 w-6 animate-bounce text-rose-600" />
            <button
              type="button"
              aria-label="Open immediate help options"
              className="group flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition hover:scale-105 hover:bg-rose-600"
              onClick={() => {
                document
                  .querySelector<HTMLButtonElement>('[data-testid="emergency-widget-toggle"]')
                  ?.click();
              }}
            >
              <Hand className="h-6 w-6 transition group-hover:scale-110" />
            </button>
            <p className="mt-1 text-[11px] text-ink-500">
              Same hand signal button lives in the bottom-right corner of every page.
            </p>
          </div>
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
            If you are in immediate danger, call local emergency services.
          </div>
        </ToolCard>

        <ToolCard
          icon={<FileText className="h-6 w-6 text-ink-900" />}
          title="Document an incident"
          color="bg-cream-200"
          summary="Privately record dates, details, photos, and voice notes. Only your account can open it."
        >
          <div className="flex flex-col gap-2">
            <Link
              to="/journal"
              data-testid="tools-document-incident"
              className="btn-dark w-full"
            >
              Open Private Journal
            </Link>
            <p className="text-xs text-ink-500">
              Nothing here is shared to the public board. Use it to build a record if you ever choose to report.
            </p>
          </div>
        </ToolCard>

        <ToolCard
          icon={<BookOpen className="h-6 w-6 text-rose-600" />}
          title="My Notebooks"
          color="bg-rose-100"
          summary="Your private stories, saved drafts, and incident reports — all in one place."
        >
          <div className="flex flex-col gap-2">
            <Link
              to="/tell-your-story"
              search={{ tab: "mine" }}
              data-testid="tools-my-notebooks"
              className="btn-rose w-full"
            >
              Open My Notebooks
            </Link>
            <p className="text-xs text-ink-500">
              Only you can see these. Share to the public board only when you choose to.
            </p>
          </div>
        </ToolCard>

        <ToolCard
          icon={<MousePointer2 className="h-6 w-6 text-ink-900" />}
          title="Need help now?"
          color="bg-cream-200"
          summary="Crisis hotlines are one click away."
        >
          <div className="flex flex-col gap-2">
            <a
              href="https://www.thehotline.org/"

              rel="noopener noreferrer"
              className="btn-dark w-full"
            >
              The Hotline (women)
            </a>
            <a
              href="https://childhelphotline.org/"

              rel="noopener noreferrer"
              className="btn-dark w-full"
            >
              Childhelp Hotline (girls)
            </a>
          </div>
        </ToolCard>

        <ToolCard
          icon={<Pencil className="h-6 w-6 text-rose-600" />}
          title="Tell Your Story"
          color="bg-rose-100"
          summary="Write privately in your own notebook, or share anonymously to the community board."
        >
          <div className="flex flex-col gap-2">
            <Link
              to="/tell-your-story"
              data-testid="tools-tell-story"
              className="btn-rose w-full"
            >
              Open Tell Your Story
            </Link>
            <p className="text-xs text-ink-500">
              Your nickname, your choice. Nothing is shared unless you decide to share it.
            </p>
          </div>
        </ToolCard>

        <ToolCard
          icon={<Users className="h-6 w-6 text-ink-900" />}
          title="The Board"
          color="bg-cream-200"
          summary="Read anonymous, blurred stories from women and girls. Tap to reveal when you feel ready."
        >
          <div className="flex flex-col gap-2">
            <Link
              to="/board"
              data-testid="tools-board"
              className="btn-dark w-full"
            >
              Go to The Board
            </Link>
            <p className="text-xs text-ink-500">
              Names and identifying details are removed. React only if it feels safe.
            </p>
          </div>
        </ToolCard>
      </div>

      <div className="mt-10 text-center">

        <Link to="/resources" className="text-sm font-semibold text-rose-600 hover:underline">
          Browse full resources directory →
        </Link>
      </div>
    </div>
  );
}

function ToolCard({
  icon,
  title,
  color,
  summary,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <details className="note-card group overflow-hidden p-0">
      <summary className="flex cursor-pointer list-none items-center gap-4 p-5">
        <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${color}`}>{icon}</span>
        <span className="flex-1">
          <span className="block font-serif text-lg text-ink-900">{title}</span>
          <span className="mt-1 block text-sm text-ink-600">{summary}</span>
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-ink-500 transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-ink-200 p-5 pt-4">{children}</div>
    </details>
  );
}
