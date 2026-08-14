import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Attachment = { path: string; name: string; type?: string; size?: number };

async function sign(path: string) {
  const { data } = await supabase.storage.from("evidence").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export function IncidentMedia({
  attachments = [],
  audioPath,
}: {
  attachments?: Attachment[];
  audioPath?: string | null;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [audio, setAudio] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const key = `${attachments.map((a) => a.path).join(",")}|${audioPath ?? ""}`;

  useEffect(() => {
    let alive = true;
    (async () => {
      const next: Record<string, string> = {};
      for (const a of attachments) {
        const u = await sign(a.path);
        if (u) next[a.path] = u;
      }
      if (alive) setUrls(next);
      if (audioPath) {
        const u = await sign(audioPath);
        if (alive) setAudio(u);
      } else if (alive) setAudio(null);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (attachments.length === 0 && !audioPath) return null;

  const isImage = (a: Attachment) =>
    (a.type ?? "").startsWith("image/") || /\.(png|jpe?g|gif|webp|heic|avif)$/i.test(a.name);

  return (
    <div className="mt-4 space-y-3">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {attachments.map((a) => {
            const url = urls[a.path];
            if (isImage(a) && url) {
              return (
                <button
                  key={a.path}
                  type="button"
                  onClick={() => setLightbox(url)}
                  className="overflow-hidden rounded-xl border border-ink-300"
                  title={a.name}
                >
                  <img src={url} alt={a.name} className="h-28 w-28 object-cover" loading="lazy" />
                </button>
              );
            }
            return (
              <a
                key={a.path}
                href={url ?? "#"}
                target="_self"
                className="rounded-full border border-ink-300 px-3 py-1 text-xs text-ink-700 hover:bg-cream-100"
              >
                📎 {a.name}
              </a>
            );
          })}
        </div>
      )}

      {audioPath && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Voice note</p>
          {audio ? (
            <audio controls src={audio} className="mt-1 w-full max-w-sm" />
          ) : (
            <p className="text-xs text-ink-500">Loading voice note…</p>
          )}
        </div>
      )}

      {lightbox && (
        <div
          role="dialog"
          aria-label="Attachment preview"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/80 p-6"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Attachment" className="max-h-full max-w-full rounded-xl" />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-5 top-5 rounded-full bg-cream-50 px-3 py-1 text-sm font-semibold text-ink-900"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
