import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { performQuickExit } from "@/components/QuickExit";
import { AlertTriangle, Ban, EyeOff, FileText, Hand, HeartPulse, LogOut, MousePointer2, MoveDown, Shield } from "lucide-react";

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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          summary="A silent way to signal distress. Tap the heart button in the bottom-right corner of any page."
        >
          <div className="flex flex-col items-center gap-2 py-2">
            <p className="text-sm font-semibold text-ink-900">
              Click button for immediate help options
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
              <HeartPulse className="h-6 w-6 transition group-hover:scale-110" />
            </button>
            <p className="mt-1 text-[11px] text-ink-500">
              Same button lives in the bottom-right corner of every page.
            </p>
          </div>
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
            If you are in immediate danger, call local emergency services.
          </div>
        </ToolCard>

        <ToolCard
          icon={<Shield className="h-6 w-6 text-ink-900" />}
          title="Cover your tracks"
          color="bg-cream-200"
          summary="Clear browser history, use private mode, and avoid shared devices."
        >
          <ul className="list-disc space-y-1 pl-4 text-sm text-ink-700">
            <li>Use your browser's private / incognito mode.</li>
            <li>Clear history, cookies, and cache after visiting.</li>
            <li>Close all tabs and log out of shared accounts.</li>
          </ul>
        </ToolCard>

        <ToolCard
          icon={<Ban className="h-6 w-6 text-ink-900" />}
          title="Do not save passwords"
          color="bg-cream-200"
          summary="Never let a browser save your MrsANONymous password on a shared device."
        >
          <p className="text-sm text-ink-700">
            If your browser offers to remember your password, choose "Never". An abuser may check saved passwords.
          </p>
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
              target="_blank"
              rel="noopener noreferrer"
              className="btn-dark w-full"
            >
              The Hotline (women)
            </a>
            <a
              href="https://childhelphotline.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-dark w-full"
            >
              Childhelp Hotline (girls)
            </a>
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
    <div className="note-card flex flex-col p-6">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${color}`}>{icon}</div>
      <h3 className="font-serif text-xl text-ink-900">{title}</h3>
      <p className="mt-2 text-sm text-ink-600">{summary}</p>
      <div className="mt-4 flex-1">{children}</div>
    </div>
  );
}
