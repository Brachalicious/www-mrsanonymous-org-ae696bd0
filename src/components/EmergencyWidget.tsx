import { useState } from "react";
import { Phone, X, HeartPulse } from "lucide-react";

export function EmergencyWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div className="note-card w-64 overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-ink-900">Need help now?</h3>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close emergency widget"
              className="rounded p-1 text-ink-500 hover:bg-ink-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-500">
            If you are in immediate danger, call emergency services or a trusted hotline.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href="tel:988"
              data-testid="emergency-call-988"
              className="btn-rose w-full py-2 text-xs"
            >
              <Phone className="h-3.5 w-3.5" /> Call 988
            </a>
            <a
              href="tel:911"
              data-testid="emergency-call-911"
              className="btn-ghost w-full py-2 text-xs"
            >
              <Phone className="h-3.5 w-3.5" /> Call 911
            </a>
          </div>
          <p className="mt-3 text-[10px] text-ink-400">
            You can also click the red Quick Exit button at any time to leave this site.
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
