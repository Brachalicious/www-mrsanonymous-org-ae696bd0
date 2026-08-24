import { useEffect, useState } from "react";
import { Phone, X, MapPin, MessageSquare, Settings, Home, Plus, Trash2 } from "lucide-react";
import {
  loadAddresses,
  saveAddresses,
  loadDefaultAddressId,
  saveDefaultAddressId,
  newAddressId,
  type SavedAddress,
} from "@/lib/saved-addresses";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES, translateToEnglish, type LangCode } from "@/lib/translations";
import { getEmergency } from "@/lib/emergency-numbers";
import { useRegion } from "@/hooks/use-region";
import helpSignalButton from "@/assets/help-signal-button.png.asset.json";

const MSG_KEY = "mrsanon:panic-message";
const MSG_LANG_KEY = "mrsanon:panic-msg-lang";
const DEFAULT_MSG =
  "Emergency. I need help. Please send police to my location.";

type Loc = {
  lat: number;
  lon: number;
  accuracy: number;
  address?: string;
  at: number;
};

// Only trust a reverse-geocoded street address when the GPS fix is tight.
const ADDRESS_ACCURACY_LIMIT_M = 75;
const GOOD_ACCURACY_M = 25;

export function EmergencyWidget() {
  const { t, lang: uiLang } = useLanguage();
  const { country: region } = useRegion();
  const emergency = getEmergency(uiLang, region);
  const [open, setOpen] = useState(false);
  const [loc, setLoc] = useState<Loc | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [editMsg, setEditMsg] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MSG);
  const [msgLang, setMsgLang] = useState<LangCode>("en");
  const [preparing, setPreparing] = useState(false);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [editAddrs, setEditAddrs] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddr, setNewAddr] = useState("");

  useEffect(() => {
    const list = loadAddresses();
    setAddresses(list);
    const def = loadDefaultAddressId();
    setSelectedAddrId(def && list.some((a) => a.id === def) ? def : (list[0]?.id ?? null));
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddrId) ?? null;

  function persist(list: SavedAddress[], defId: string | null) {
    setAddresses(list);
    saveAddresses(list);
    setSelectedAddrId(defId);
    saveDefaultAddressId(defId);
  }

  function addAddress() {
    const address = newAddr.trim();
    if (!address) return;
    const entry: SavedAddress = {
      id: newAddressId(),
      label: newLabel.trim() || "Address",
      address,
    };
    const list = [...addresses, entry];
    persist(list, selectedAddrId ?? entry.id);
    setNewLabel("");
    setNewAddr("");
  }

  function removeAddress(id: string) {
    const list = addresses.filter((a) => a.id !== id);
    const nextId = selectedAddrId === id ? (list[0]?.id ?? null) : selectedAddrId;
    persist(list, nextId);
  }

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("mrsanon:open-emergency", onOpen);
    return () => window.removeEventListener("mrsanon:open-emergency", onOpen);
  }, []);

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
    setLoc(null);

    // Sample repeatedly and keep the tightest fix — the first GPS reading is
    // often a coarse wifi/cell estimate that can be miles off.
    let best: GeolocationPosition | null = null;
    let settled = false;

    const finish = async () => {
      if (settled) return;
      settled = true;
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
      if (!best) {
        setLocLoading(false);
        setLocError("Could not get an accurate location. Move near a window and try again.");
        return;
      }
      const { latitude, longitude, accuracy } = best.coords;
      const next: Loc = { lat: latitude, lon: longitude, accuracy, at: Date.now() };
      if (accuracy <= ADDRESS_ACCURACY_LIMIT_M) {
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
      }
      setLoc(next);
      setLocLoading(false);
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos;
        // Show coordinates instantly — refine in the background.
        const { latitude, longitude, accuracy } = (best as GeolocationPosition).coords;
        setLoc((prev) => ({ ...(prev ?? {}), lat: latitude, lon: longitude, accuracy, at: Date.now() }));
        setLocLoading(false);
        if (pos.coords.accuracy <= GOOD_ACCURACY_M) void finish();
      },
      (err) => {
        if (best) return; // keep whatever we already have
        settled = true;
        navigator.geolocation.clearWatch(watchId);
        clearTimeout(timer);
        setLocError(err.message || "Could not get location.");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 15000 },
    );

    const timer = setTimeout(() => void finish(), 6000);

  }

  function buildSmsBody(englishMessage: string, original?: string) {
    const parts: string[] = [englishMessage.trim() || DEFAULT_MSG];
    if (original && original.trim() && original.trim() !== englishMessage.trim()) {
      const langLabel = LANGUAGES.find((l) => l.code === msgLang)?.label ?? msgLang;
      parts.push(`[Original (${langLabel}): ${original.trim()}]`);
    }
    if (loc) {
      // GPS coordinates first: dispatch trusts these, not a guessed address.
      parts.push(
        `GPS: ${loc.lat.toFixed(6)}, ${loc.lon.toFixed(6)} (accurate to ~${Math.round(loc.accuracy)}m)`,
      );
      parts.push(`Map: https://maps.google.com/?q=${loc.lat},${loc.lon}`);
      if (loc.address) {
        parts.push(`Approx address (unverified): ${loc.address}`);
      }
      const ageMin = Math.round((Date.now() - loc.at) / 60000);
      if (ageMin >= 1) parts.push(`Location taken ${ageMin} min ago.`);
    }
    if (selectedAddress) {
      parts.push(
        `${loc ? "Saved" : "Saved (no GPS)"} address — ${selectedAddress.label}: ${selectedAddress.address}`,
      );
    }
    return parts.join("\n");
  }


  // Fallback (English) href so the link is valid even before translation runs.
  const smsNumber = emergency.sms ?? emergency.police;
  const fallbackHref = `sms:${smsNumber}?&body=${encodeURIComponent(buildSmsBody(message))}`;

  async function handleTextClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (msgLang === "en") return; // fallbackHref already correct
    e.preventDefault();
    setPreparing(true);
    try {
      const original = message.trim() || DEFAULT_MSG;
      const english = await translateToEnglish(original, msgLang);
      const body = buildSmsBody(english, original);
      window.location.href = `sms:${smsNumber}?&body=${encodeURIComponent(body)}`;
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
            {emergency.crisis && (
              <a
                href={`tel:${emergency.crisis}`}
                data-testid="emergency-call-crisis"
                className="btn-rose w-full py-2 text-xs"
              >
                <Phone className="h-3.5 w-3.5" /> {t("safety.callEmergency")} {emergency.crisisLabel ?? emergency.crisis}
              </a>
            )}
            <a
              href={`tel:${emergency.police}`}
              data-testid="emergency-call-police"
              className="btn-ghost w-full py-2 text-xs"
            >
              <Phone className="h-3.5 w-3.5" /> {t("safety.callEmergency")} {emergency.policeLabel}
            </a>
            {emergency.medical && emergency.medical !== emergency.police && (
              <a
                href={`tel:${emergency.medical}`}
                data-testid="emergency-call-medical"
                className="btn-ghost w-full py-2 text-xs"
              >
                <Phone className="h-3.5 w-3.5" /> {t("safety.callEmergency")} {emergency.medicalLabel ?? emergency.medical}
              </a>
            )}
            {emergency.fire && emergency.fire !== emergency.police && emergency.fire !== emergency.medical && (
              <a
                href={`tel:${emergency.fire}`}
                data-testid="emergency-call-fire"
                className="btn-ghost w-full py-2 text-xs"
              >
                <Phone className="h-3.5 w-3.5" /> {t("safety.callEmergency")} {emergency.fireLabel ?? emergency.fire}
              </a>
            )}

            {emergency.smsSupported && (
              <a
                href={fallbackHref}
                onClick={handleTextClick}
                data-testid="emergency-text-emergency"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-red-600 py-2 text-xs font-extrabold uppercase tracking-widest text-white hover:bg-red-700"
              >
                <MessageSquare className="h-3.5 w-3.5" />{" "}
                {preparing ? t("emg.translating") : `${t("emg.text911").replace("911", emergency.sms ?? emergency.police)}`}
              </a>
            )}
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
              <div className="mt-1 space-y-0.5 break-words text-[10px] text-ink-700">
                <p>
                  {loc.lat.toFixed(6)}, {loc.lon.toFixed(6)} (±{Math.round(loc.accuracy)}m)
                </p>
                {loc.address && (
                  <p className="text-ink-500">Approx address (unverified): {loc.address}</p>
                )}
                {loc.accuracy > ADDRESS_ACCURACY_LIMIT_M && (
                  <p className="text-rose-600">
                    Weak GPS fix — coordinates may be off. Tap refresh outdoors or near a window for a precise location.
                  </p>
                )}
              </div>
            )}
            {!loc && !locError && (
              <p className="mt-1 text-[10px] text-ink-500">
                {t("emg.attachLoc")}
              </p>
            )}
          </div>

          <div className="mt-3 rounded-lg border border-ink-300/60 bg-cream-100 p-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-widest text-ink-700">
                <Home className="h-3 w-3" /> Saved addresses
              </span>
              <button
                onClick={() => setEditAddrs((v) => !v)}
                data-testid="saved-address-toggle"
                className="rounded border border-ink-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-ink-900 hover:bg-cream-200"
              >
                {editAddrs ? "Done" : "Add / edit"}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-ink-500">
              Add an address in case GPS fails or the internet is down. The one you pick is
              sent automatically when you text emergency services.
            </p>

            {addresses.length > 0 && (
              <div className="mt-2 space-y-1">
                {addresses.map((a) => (
                  <div key={a.id} className="flex items-start gap-1.5">
                    <label className="flex flex-1 cursor-pointer items-start gap-1.5 text-[10px] text-ink-700">
                      <input
                        type="radio"
                        name="mrsanon-saved-address"
                        checked={selectedAddrId === a.id}
                        onChange={() => {
                          setSelectedAddrId(a.id);
                          saveDefaultAddressId(a.id);
                        }}
                        className="mt-0.5 accent-rose-600"
                      />
                      <span className="break-words">
                        <span className="font-semibold text-ink-900">{a.label}</span>
                        {selectedAddrId === a.id && (
                          <span className="ml-1 rounded bg-rose-600 px-1 text-[9px] font-bold uppercase text-white">
                            default
                          </span>
                        )}
                        <br />
                        {a.address}
                      </span>
                    </label>
                    {editAddrs && (
                      <button
                        onClick={() => removeAddress(a.id)}
                        aria-label={`Delete ${a.label}`}
                        className="rounded p-0.5 text-ink-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {editAddrs && (
              <div className="mt-2 space-y-1.5">
                <input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Label (Home, Work, Mom's house)"
                  className="w-full rounded-md border border-ink-300 bg-white p-1.5 text-xs text-ink-900 focus:border-rose-500 focus:outline-none"
                />
                <textarea
                  value={newAddr}
                  onChange={(e) => setNewAddr(e.target.value)}
                  rows={2}
                  placeholder="Street address, apt, city, state, ZIP"
                  data-testid="saved-address-input"
                  className="w-full rounded-md border border-ink-300 bg-white p-1.5 text-xs text-ink-900 focus:border-rose-500 focus:outline-none"
                />
                <button
                  onClick={addAddress}
                  data-testid="saved-address-save"
                  className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-ink-700"
                >
                  <Plus className="h-3 w-3" /> Save address
                </button>
                <p className="text-[10px] text-ink-400">
                  Stored only on this device, never uploaded.
                </p>
              </div>
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
      <div className="flex flex-col items-end">
        <button
          onClick={() => setOpen((v) => !v)}
          data-testid="emergency-widget-toggle"
          aria-label="Open emergency help options"
          className="group focus:outline-none"
        >
          <img
            src={helpSignalButton.url}
            alt="Emergency help"
            className="h-72 w-72 transition-transform duration-300 group-hover:scale-105"
          />
        </button>
      </div>

    </div>
  );
}
