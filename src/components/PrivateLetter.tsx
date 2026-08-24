import pushpinAsset from "@/assets/red-pushpin-transparent.png.asset.json";

export function PrivateLetter() {
  return (
    <div className="mx-auto w-full max-w-[330px]">
      {/* Pinned note */}
      <div className="relative rounded-xl border-2 border-ink-900 bg-white p-6 shadow-[4px_4px_0px_rgba(0,0,0,0.18)]">
        {/* Real red push pin piercing through the top of the note */}
        <div className="absolute -top-11 left-1/2 z-10 -translate-x-1/2">
          <img
            src={pushpinAsset.url}
            alt=""
            aria-hidden="true"
            className="pointer-events-none h-20 w-auto -rotate-45 drop-shadow-lg"
          />
        </div>

        <div className="mt-4 text-[14px] font-bold uppercase tracking-[0.2em] text-rose-500">
          Private Letter
        </div>

        <div className="mt-2 font-hand text-2xl text-rose-500">to whoever needs this —</div>

        <p className="mt-3 font-serif text-2xl leading-snug text-ink-900">
          “Whether you are here to tell your story, read others, or simply feel less alone — this space is for you.”
        </p>

        <p className="mt-3 text-[17px] leading-relaxed text-ink-500">
          You choose what to share, how to share, and when to share.
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-[15px] text-ink-300">— Mrs. Anonymous</span>
          <span className="font-hand text-2xl text-rose-400">xx</span>
        </div>
      </div>
    </div>
  );
}

