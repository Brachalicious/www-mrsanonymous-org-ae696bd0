import { useEffect, useState, useCallback } from "react";

const LS_ENABLED = "calc_disguise_enabled";
const LS_PASSCODE = "calc_disguise_passcode";
const SS_UNLOCKED = "calc_disguise_unlocked";

// Public helpers so other screens (e.g. /download) can toggle the gate.
export function isDisguiseEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LS_ENABLED) === "1";
}
export function setDisguiseEnabled(on: boolean) {
  if (typeof window === "undefined") return;
  if (on) {
    window.localStorage.setItem(LS_ENABLED, "1");
  } else {
    window.localStorage.removeItem(LS_ENABLED);
    window.localStorage.removeItem(LS_PASSCODE);
    window.sessionStorage.removeItem(SS_UNLOCKED);
  }
  window.dispatchEvent(new Event("calc-disguise-changed"));
}

/** True when the calculator disguise is currently covering the app. */
export function isDisguiseLocked() {
  if (typeof window === "undefined") return false;
  if (!isDisguiseEnabled()) return false;
  return window.sessionStorage.getItem(SS_UNLOCKED) !== "1";
}


type Mode = "locked" | "setup";

export function CalcGate() {
  const [hydrated, setHydrated] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [mode, setMode] = useState<Mode>("locked");
  const [sequence, setSequence] = useState<string>("");
  const [display, setDisplay] = useState<string>("0");
  const [shake, setShake] = useState(false);

  const refresh = useCallback(() => {
    const on = isDisguiseEnabled();
    setEnabled(on);
    setUnlocked(window.sessionStorage.getItem(SS_UNLOCKED) === "1");
    setMode(on && !window.localStorage.getItem(LS_PASSCODE) ? "setup" : "locked");
    setSequence("");
    setDisplay("0");
  }, []);

  useEffect(() => {
    setHydrated(true);
    refresh();
    const handler = () => refresh();
    window.addEventListener("calc-disguise-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("calc-disguise-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  if (!hydrated || !enabled || unlocked) return null;

  function press(key: string) {
    if (key === "AC") {
      setSequence("");
      setDisplay("0");
      return;
    }
    if (key === "=") {
      if (!sequence) return;
      const stored = window.localStorage.getItem(LS_PASSCODE);
      if (mode === "setup" || !stored) {
        window.localStorage.setItem(LS_PASSCODE, sequence);
        window.sessionStorage.setItem(SS_UNLOCKED, "1");
        setUnlocked(true);
        return;
      }
      if (sequence === stored) {
        window.sessionStorage.setItem(SS_UNLOCKED, "1");
        setUnlocked(true);
        return;
      }
      // Wrong: compute a normal-looking result so it feels like a real calculator.
      try {
        // eslint-disable-next-line no-new-func
        const val = Function(`"use strict"; return (${sequence.replace(/×/g, "*").replace(/÷/g, "/")})`)();
        setDisplay(String(val));
      } catch {
        setDisplay("Error");
      }
      setSequence("");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    const next = sequence + key;
    setSequence(next);
    setDisplay(next);
  }

  const keys: { label: string; cls: string }[] = [
    { label: "AC", cls: "bg-white text-black" },
    { label: "(", cls: "bg-white text-black" },
    { label: ")", cls: "bg-white text-black" },
    { label: "÷", cls: "bg-red-600 text-white" },
    { label: "7", cls: "bg-neutral-900 text-white" },
    { label: "8", cls: "bg-neutral-900 text-white" },
    { label: "9", cls: "bg-neutral-900 text-white" },
    { label: "×", cls: "bg-red-600 text-white" },
    { label: "4", cls: "bg-neutral-900 text-white" },
    { label: "5", cls: "bg-neutral-900 text-white" },
    { label: "6", cls: "bg-neutral-900 text-white" },
    { label: "-", cls: "bg-red-600 text-white" },
    { label: "1", cls: "bg-neutral-900 text-white" },
    { label: "2", cls: "bg-neutral-900 text-white" },
    { label: "3", cls: "bg-neutral-900 text-white" },
    { label: "+", cls: "bg-red-600 text-white" },
    { label: "0", cls: "bg-neutral-900 text-white col-span-2" },
    { label: ".", cls: "bg-neutral-900 text-white" },
    { label: "=", cls: "bg-red-600 text-white" },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-5 pt-6 text-xs text-neutral-500">
        <span>Calculator</span>
        {mode === "setup" ? (
          <span className="text-red-500">Set passcode → press =</span>
        ) : (
          <span>&nbsp;</span>
        )}
      </div>

      <div
        className={`flex-1 px-6 pb-4 pt-8 text-right font-mono text-6xl leading-none tracking-tight ${
          shake ? "animate-pulse" : ""
        }`}
        style={{ overflowWrap: "anywhere" }}
        onDoubleClick={() => {
          // Hidden escape hatch: double-tap the display to turn disguise off.
          if (confirm("Turn off Calculator disguise?")) setDisguiseEnabled(false);
        }}
        title="Double-tap to disable disguise"
      >
        {display || "0"}
      </div>

      <div className="grid grid-cols-4 gap-2 p-3 pb-6">
        {keys.map((k) => (
          <button
            key={k.label}
            onClick={() => press(k.label)}
            className={`${k.cls} h-16 rounded-full text-2xl font-semibold shadow active:scale-95 transition`}
          >
            {k.label}
          </button>
        ))}
      </div>
    </div>
  );
}
