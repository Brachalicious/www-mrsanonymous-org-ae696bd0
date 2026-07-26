import { useEffect, useState } from "react";
import { Phone, X, HeartPulse, MapPin, MessageSquare, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES, translateToEnglish, type LangCode } from "@/lib/translations";

const MSG_KEY = "mrsanon:panic-message";
const MSG_LANG_KEY = "mrsanon:panic-msg-lang";
const DEFAULT_MSG =
  "Emergency. I need help. Please send police to my location.";

type Loc = {
  lat: number;
  lon: number;
  accuracy: number;
  address?: string;
};

export function EmergencyWidget() {
  const { t, lang: uiLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loc, setLoc] = useState<Loc | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [editMsg, setEditMsg] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MSG);
  const [msgLang, setMsgLang] = useState<LangCode>("en");
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MSG_KEY);
      if (stored) setMessage(stored);
      const storedLang = localStorage.getItem(MSG_LANG_KEY) as LangCode | null;
      if (storedLang && LANGUAGES.some((l) => l.code === storedLang)) {
        setMsgLang(storedLang);
      } else if (LANGUAGES.some((l) => l.code === uiLang)) {
        setMsgLang(uiLang);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveMessage(next: string) {
    setMessage(next);
    try {
      localStorage.setItem(MSG_KEY, next);
    } catch {}
  }

  function saveMsgLang(next: LangCode) {
    setMsgLang(next);
    try {
      localStorage.setItem(MSG_LANG_KEY, next);
    } catch {}
  }

  async function getLocation() {
    if (!("geolocation" in navigator)) {
      setLocError("Location not supported on this device.");
      return;
    }
    setLocLoading(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const next: Loc = { lat: latitude, lon: longitude, accuracy };
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`,
            { headers: { Accept: "application/json" } },
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.display_name) next.address = data.display_name;
          }
        } catch {}
        setLoc(next);
        setLocLoading(false);
      },
      (err) => {
        setLocError(err.message || "Could not get location.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  function buildSmsBody(englishMessage: string, original?: string) {
    const parts: string[] = [englishMessage.trim() || DEFAULT_MSG];
    if (original && original.trim() && original.trim() !== englishMessage.trim()) {
      const langLabel = LANGUAGES.find((l) => l.code === msgLang)?.label ?? msgLang;
      parts.push(`[Original (${langLabel}): ${original.trim()}]`);
    }
    if (loc) {
      if (loc.address) parts.push(`Address: ${loc.address}`);
      parts.push(
        `Coordinates: ${loc.lat.toFixed(5)}, ${loc.lon.toFixed(5)} (±${Math.round(loc.accuracy)}m)`,
      );
      parts.push(
        `Map: https://maps.google.com/?q=${loc.lat},${loc.lon}`,
      );
    }
    return parts.join("\n");
  }

  // Fallback (English) href so the link is valid even before translation runs.
  const fallbackHref = `sms:911?&body=${encodeURIComponent(buildSmsBody(message))}`;

  async function handleTextClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (msgLang === "en") return; // fallbackHref already correct
    e.preventDefault();
    setPreparing(true);
    try {
      const original = message.trim() || DEFAULT_MSG;
      const english = await translateToEnglish(original, msgLang);
      const body = buildSmsBody(english, original);
      window.location.href = `sms:911?&body=${encodeURIComponent(body)}`;
    } finally {
      setPreparing(false);
    }
  }

  const msgLangDir = LANGUAGES.find((l) => l.code === msgLang)?.dir ?? "ltr";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="note-card w-80 max-w-[92vw] overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-ink-900">{t("emg.title")}</h3>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close emergency widget"
              className="rounded p-1 text-ink-500 hover:bg-ink-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-500">
            {t("emg.disclaimer")}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href="tel:988"
              data-testid="emergency-call-988"
              className="btn-rose w-full py-2 text-xs"
            >
              <Phone className="h-3.5 w-3.5" /> {t("emg.call988")}
            </a>
            <a
              href="tel:911"
              data-testid="emergency-call-911"
              className="btn-ghost w-full py-2 text-xs"
            >
              <Phone className="h-3.5 w-3.5" /> {t("emg.call911")}
            </a>
            <a
              href={fallbackHref}
              onClick={handleTextClick}
              data-testid="emergency-text-911"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-red-600 py-2 text-xs font-extrabold uppercase tracking-widest text-white hover:bg-red-700"
            >
              <MessageSquare className="h-3.5 w-3.5" />{" "}
              {preparing ? t("emg.translating") : t("emg.text911")}
            </a>
          </div>

          <div className="mt-3 rounded-lg border border-ink-300/60 bg-cream-100 p-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-ink-700">
                <MapPin className="h-3 w-3" /> {t("emg.location")}
              </span>
              <button
                onClick={getLocation}
                disabled={locLoading}
                className="rounded border border-ink-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-ink-900 hover:bg-cream-200 disabled:opacity-50"
              >
                {locLoading ? t("emg.locating") : loc ? t("emg.refresh") : t("emg.getLocation")}
              </button>
            </div>
            {locError && (
              <p className="mt-1 text-[10px] text-rose-600">{locError}</p>
            )}
            {loc && (
              <p className="mt-1 break-words text-[10px] text-ink-700">
                {loc.address ? loc.address + " · " : ""}
                {loc.lat.toFixed(5)}, {loc.lon.toFixed(5)} (±{Math.round(loc.accuracy)}m)
              </p>
            )}
            {!loc && !locError && (
              <p className="mt-1 text-[10px] text-ink-500">
                {t("emg.attachLoc")}
              </p>
            )}
          </div>

          <div className="mt-3">
            <button
              onClick={() => setEditMsg((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink-700 hover:text-rose-600"
            >
              <Settings className="h-3 w-3" />
              {editMsg ? t("emg.hideMsg") : t("emg.editMsg")}
            </button>
            {editMsg && (
              <div className="mt-2 space-y-2">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-700">
                    {t("emg.msgLang")}
                  </span>
                  <select
                    data-testid="emergency-msg-lang"
                    value={msgLang}
                    onChange={(e) => saveMsgLang(e.target.value as LangCode)}
                    className="mt-1 w-full rounded-md border border-ink-300 bg-white p-1.5 text-xs text-ink-900 focus:border-rose-500 focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.native} ({l.label})
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => saveMessage(e.target.value)}
                  rows={3}
                  lang={msgLang}
                  dir={msgLangDir}
                  inputMode="text"
                  className="w-full rounded-md border border-ink-300 bg-white p-2 text-xs text-ink-900 focus:border-rose-500 focus:outline-none"
                  placeholder={t("emg.msgPlaceholder")}
                />
                {msgLang !== "en" && (
                  <p className="text-[10px] text-ink-500">{t("emg.translateNote")}</p>
                )}
              </div>
            )}
          </div>

          <p className="mt-3 text-[10px] text-ink-400">
            {t("emg.textFooter")}
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        data-testid="emergency-widget-toggle"
        aria-label="Open emergency help options"
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg transition hover:scale-105 hover:bg-rose-600"
      >
        <HeartPulse className="h-6 w-6 transition group-hover:scale-110" />
      </button>
    </div>
  );
}
