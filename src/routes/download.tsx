import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/download")({
  component: DownloadPage,
  head: () => ({
    meta: [
      { title: "Download the MrsANONymous App — iOS & Android" },
      { name: "description", content: "Install MrsANONymous.org as a free safety app on your iPhone or Android in under 30 seconds. No app store, no traces, 100% anonymous." },
      { property: "og:title", content: "Download the MrsANONymous App" },
      { property: "og:description", content: "Install as a private safety app on iPhone or Android in under 30 seconds." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/download" },
    ],
    links: [{ rel: "canonical", href: "/download" }],
  }),
});

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installEvent, setInstallEvent] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [disguise, setDisguise] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) return;
    const original = link.getAttribute("href") || "/manifest.webmanifest";
    link.setAttribute("href", disguise ? "/manifest-calc.webmanifest" : "/manifest.webmanifest");
    // update apple touch icon too so iOS Add-to-Home uses calc icon
    const apple = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    const appleOrig = apple?.getAttribute("href") || "/apple-touch-icon.png";
    if (apple) apple.setAttribute("href", disguise ? "/calc-icon-192.png" : "/apple-touch-icon.png");
    return () => {
      link.setAttribute("href", original);
      if (apple) apple.setAttribute("href", appleOrig);
    };
  }, [disguise]);

  async function handleInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    const result = await installEvent.userChoice;
    if (result?.outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  }

  return (
    <div className="paper-bg min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <img
            src={disguise ? "/calc-icon-512.png" : "/app-icon-512.png"}
            alt={disguise ? "Calculator app icon" : "MrsANONymous app icon"}
            width={128}
            height={128}
            className="mx-auto rounded-3xl shadow-lg"
          />
          <h1 className="mt-6 font-serif text-4xl font-bold text-ink-900 sm:text-5xl">
            {disguise ? "Install as “Calculator” (disguised)" : "Download the MrsANONymous App"}
          </h1>
          <p className="mt-3 text-lg text-ink-700">
            A discreet safety companion for your phone. Free. No app store. No account traces. 100% anonymous.
          </p>
        </div>

        <div className="mt-6 rounded-xl border-2 border-ink-300 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink-900">🕶️ Disguise Mode</h3>
              <p className="mt-1 text-sm text-ink-700">
                Install the app so it shows up on your home screen as a plain
                <strong> Calculator</strong> — calculator icon, calculator name.
                Only you know what it really opens. Turn this on <em>before</em> you install.
              </p>
            </div>
            <label className="flex shrink-0 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={disguise}
                onChange={(e) => setDisguise(e.target.checked)}
                className="h-5 w-5 accent-rose-600"
                data-testid="toggle-disguise"
              />
              <span className="text-sm font-semibold text-ink-900">
                {disguise ? "On" : "Off"}
              </span>
            </label>
          </div>
          {disguise && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-ink-700">
              When your phone asks for a name during install, keep it as
              <strong> “Calculator”</strong>. On iPhone you can also type
              <strong> Calculator</strong> in the “Add to Home Screen” name field.
            </p>
          )}
        </div>

        {installed && (
          <div className="mt-8 rounded-xl border-2 border-green-600 bg-green-50 p-6 text-center">
            <p className="text-xl font-semibold text-green-900">✓ Installed on this device</p>
            <p className="mt-1 text-sm text-green-800">Look for the MrsANON icon on your home screen.</p>
          </div>
        )}

        {!installed && installEvent && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={handleInstall}
              className="btn-rose text-lg"
              data-testid="btn-install-app"
            >
              {disguise ? "🧮 Install as Calculator" : "📥 Install Now"}
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <Card active={platform === "ios"} title="📱 iPhone / iPad (iOS)">
            <ol className="ml-5 list-decimal space-y-2 text-sm text-ink-700">
              <li>Open <strong>mrsanonymous.org</strong> in <strong>Safari</strong> (not Chrome).</li>
              <li>Tap the <strong>Share</strong> button <span aria-label="share icon">⬆️</span> at the bottom.</li>
              <li>Scroll and tap <strong>“Add to Home Screen”</strong>.</li>
              <li>Tap <strong>Add</strong>. The MrsANON icon will appear on your home screen.</li>
            </ol>
          </Card>

          <Card active={platform === "android"} title="🤖 Android">
            <ol className="ml-5 list-decimal space-y-2 text-sm text-ink-700">
              <li>Open <strong>mrsanonymous.org</strong> in <strong>Chrome</strong>.</li>
              <li>Tap the <strong>⋮</strong> menu (top-right).</li>
              <li>Tap <strong>“Install app”</strong> or <strong>“Add to Home screen”</strong>.</li>
              <li>Confirm. The MrsANON icon will appear on your home screen.</li>
            </ol>
          </Card>
        </div>

        <div className="mt-10 rounded-xl border border-ink-300 bg-white p-6">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">Why install?</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li>🚨 One-tap emergency access to 911, hotlines, and the Signal for Help.</li>
            <li>🌐 Works in 17+ languages with auto-translation for 911 texts.</li>
            <li>🔒 Quick Exit and history-clearing safety features built in.</li>
            <li>📓 Your private notebooks — always with you, always anonymous.</li>
            <li>📶 Opens instantly like a native app — no browser bar, no bookmarks needed.</li>
          </ul>
        </div>

        <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50 p-6">
          <h3 className="font-serif text-lg font-semibold text-ink-900">Safety tip</h3>
          <p className="mt-2 text-sm text-ink-700">
            You can rename the app icon on your home screen to something innocuous like “Notes” or
            “Weather” after installing, if you need extra discretion.
          </p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, active, children }: { title: string; active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-xl border-2 bg-white p-6 ${
        active ? "border-rose-500 shadow-lg" : "border-ink-300"
      }`}
    >
      <h3 className="font-serif text-xl font-semibold text-ink-900">
        {title} {active && <span className="ml-1 text-xs text-rose-600">← your device</span>}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}