import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { isDisguiseLocked } from "./CalcGate";

const LS_TERMS = "terms_accepted_v1";

export function hasAcceptedTerms() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LS_TERMS) === "1";
}

export function resetTermsAcceptance() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LS_TERMS);
  window.dispatchEvent(new Event("terms-changed"));
}

/**
 * Full-screen agreement shown once, after the calculator disguise is unlocked
 * and before any of the app content becomes usable.
 */
export function TermsGate() {
  const [hydrated, setHydrated] = useState(false);
  const [accepted, setAccepted] = useState(true);
  const [calcLocked, setCalcLocked] = useState(true);
  const [checked, setChecked] = useState(false);
  const [ageChecked, setAgeChecked] = useState(false);

  const refresh = useCallback(() => {
    setAccepted(hasAcceptedTerms());
    setCalcLocked(isDisguiseLocked());
  }, []);

  useEffect(() => {
    setHydrated(true);
    refresh();
    const handler = () => refresh();
    window.addEventListener("calc-disguise-changed", handler);
    window.addEventListener("terms-changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("calc-disguise-changed", handler);
      window.removeEventListener("terms-changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  // Lock background scroll while the gate is up.
  const visible = hydrated && !accepted && !calcLocked;
  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) return null;

  function agree() {
    window.localStorage.setItem(LS_TERMS, "1");
    setAccepted(true);
  }

  const canAgree = checked && ageChecked;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-gate-title"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-ink-900/80 p-4 backdrop-blur-sm"
      data-testid="terms-gate"
    >
      <div className="note-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6">
        <span className="hand-note text-2xl">before you begin</span>
        <h2 id="terms-gate-title" className="mt-1 font-serif text-2xl text-ink-900">
          Please agree to our Terms
        </h2>

        <div className="mt-4 space-y-3 rounded-xl border border-ink-300 bg-cream-100 p-4 text-sm leading-relaxed text-ink-700">
          <p>
            <strong>MrsANONymous is not an emergency service.</strong> If you are in
            immediate danger, call your local emergency number right away.
          </p>
          <p>
            This app offers peer support, private journaling, and resource
            information. It does not provide medical, legal, or professional
            counseling advice.
          </p>
          <p>
            Anything you post to the public board is visible to others. Never
            include real names, addresses, or other identifying details.
          </p>
          <p>
            Journals, safety plans, and recordings you create are stored for your
            own use. Keep your device secure — anyone with access to it may be
            able to open this app.
          </p>
          <p>
            Be kind. Harassment, threats, doxxing, or abusive content will be
            removed and may result in account removal.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-800">
            <input
              type="checkbox"
              checked={ageChecked}
              onChange={(e) => setAgeChecked(e.target.checked)}
              data-testid="terms-gate-age"
              className="mt-1 h-4 w-4 accent-rose-500"
            />
            <span>I understand this app is not an emergency service.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-800">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              data-testid="terms-gate-checkbox"
              className="mt-1 h-4 w-4 accent-rose-500"
            />
            <span>
              I agree to the{" "}
              <Link to="/terms" className="font-semibold text-rose-600 underline">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="font-semibold text-rose-600 underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={agree}
          disabled={!canAgree}
          data-testid="terms-gate-agree"
          className="btn-rose mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40"
        >
          Agree &amp; enter
        </button>

        <p className="mt-3 text-center text-xs text-ink-500">
          Press <kbd className="rounded border border-ink-300 px-1">ESC</kbd> at any
          time to leave this site instantly.
        </p>
      </div>
    </div>
  );
}
