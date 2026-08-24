import pushpinAsset from "@/assets/red-pushpin-transparent.png.asset.json";

export function PrivateLetter() {
  return (
    <div className="mx-auto w-full max-w-[220px]">
      {/* Pinned note */}
      <div className="relative -rotate-3 rounded-xl border-2 border-ink-900 bg-white p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.18)]">
        {/* Real red push pin, larger and angled */}
        <div className="absolute -top-7 left-1/2 z-10 -translate-x-1/2">
          <img
            src={pushpinAsset.url}
            alt=""
            aria-hidden="true"
            className="pointer-events-none h-16 w-auto rotate-45 drop-shadow-md"
          />
        </div>

        <div className="mt-3 text-[9px] font-bold uppercase tracking-[0.2em] text-rose-500">
          Private Letter
        </div>

        <div className="mt-1 font-hand text-base text-rose-500">to whoever needs this —</div>

        <p className="mt-2 font-serif text-base leading-snug text-ink-900">
          “Whether you are here to tell your story, read others, or simply feel less alone — this space is for you.”
        </p>

        <p className="mt-2 text-[11px] leading-relaxed text-ink-500">
          You choose what to share, how to share, and when to share.
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-ink-300">— Mrs. Anonymous</span>
          <span className="font-hand text-base text-rose-400">xx</span>
        </div>
      </div>
    </div>
  );
}

