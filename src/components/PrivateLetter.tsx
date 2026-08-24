export function PrivateLetter() {
  return (
    <div className="mx-auto w-full max-w-xs">
      {/* Pinned note */}
      <div className="relative -rotate-1 rounded-xl border-2 border-ink-900 bg-white p-5 shadow-[6px_6px_0px_rgba(0,0,0,0.18)] sm:p-6">
        {/* Red push pin */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="h-5 w-5 rounded-full bg-rose-600 shadow-[0_3px_5px_rgba(0,0,0,0.35)] ring-2 ring-rose-800/40">
            <div className="ml-1 mt-1 h-1.5 w-1.5 rounded-full bg-white/70" />
          </div>
          <div className="mx-auto h-2 w-[3px] rounded-b bg-ink-900/50" />
        </div>

        <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500">
          Private Letter
        </div>

        <div className="mt-2 font-hand text-xl text-rose-500">to whoever needs this —</div>

        <p className="mt-3 font-serif text-lg leading-snug text-ink-900">
          “Whether you are here to tell your story, read others, or simply feel less alone — this space is for you.”
        </p>

        <p className="mt-3 text-xs leading-relaxed text-ink-500">
          You choose what to share, how to share, and when to share.
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="text-[11px] text-ink-300">— Mrs. Anonymous</span>
          <span className="font-hand text-base text-rose-400">xx</span>
        </div>
      </div>
    </div>
  );
}
