export function PrivateLetter() {
  return (
    <div className="mx-auto w-full max-w-[180px]">
      {/* Pinned note */}
      <div className="relative -rotate-3 rounded-xl border-2 border-ink-900 bg-white p-3 shadow-[4px_4px_0px_rgba(0,0,0,0.18)]">
        {/* 3D red push pin */}
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <span
            aria-hidden
            className="pointer-events-none block h-4 w-4 rounded-full border border-black/20 shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
            style={{ background: "radial-gradient(circle at 32% 30%, #fca5a5, #dc2626 65%)" }}
          />
          <div className="mx-auto h-1.5 w-[2px] rounded-b bg-ink-900/60" />
        </div>

        <div className="mt-2 text-[8px] font-bold uppercase tracking-[0.2em] text-rose-500">
          Private Letter
        </div>

        <div className="mt-1 font-hand text-sm text-rose-500">to whoever needs this —</div>

        <p className="mt-1.5 font-serif text-sm leading-snug text-ink-900">
          “Whether you are here to tell your story, read others, or simply feel less alone — this space is for you.”
        </p>

        <p className="mt-1.5 text-[10px] leading-relaxed text-ink-500">
          You choose what to share, how to share, and when to share.
        </p>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[9px] text-ink-300">— Mrs. Anonymous</span>
          <span className="font-hand text-sm text-rose-400">xx</span>
        </div>
      </div>
    </div>
  );
}

