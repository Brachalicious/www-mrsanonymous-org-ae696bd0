import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import {
  COVER_PRESETS,
  decodeTheme,
  encodeTheme,
  isPreset,
  themeCoverBackground,
  coverImageStyle,
  type NotebookTheme,
} from "@/lib/notebook-covers";
import { CoverImage } from "./CoverImage";

const SWATCHES = [
  "#B91C1C", "#EF4444", "#F97316", "#F59E0B", "#FACC15", "#84CC16",
  "#22C55E", "#065F46", "#14B8A6", "#06B6D4", "#0EA5E9", "#1E3A8A",
  "#6366F1", "#7C3AED", "#A855F7", "#EC4899", "#F472B6", "#831843",
  "#78350F", "#111827", "#6B7280", "#FFFDF7",
];

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-3">
      <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">{label}</span>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`${label}: ${c}`}
            className={`h-6 w-6 rounded-full border-2 transition ${
              value.toLowerCase() === c.toLowerCase() ? "border-ink-900 scale-110" : "border-ink-300/60"
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
        <label
          className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-ink-300"
          title="Color wheel"
          style={{
            background:
              "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={`${label} color wheel`}
          />
        </label>
        <span className="ml-1 font-mono text-[11px] text-ink-500">{value}</span>
      </div>
    </div>
  );
}

export function CoverDesigner({
  value,
  onChange,
  saving,
}: {
  value: string | null | undefined;
  onChange: (color: string) => void;
  saving?: boolean;
}) {
  const { user } = useAuth();
  const theme = decodeTheme(value);
  const [mix, setMix] = useState(!!theme.coverB);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const apply = (patch: Partial<NotebookTheme>) => {
    const next: NotebookTheme = { ...theme, ...patch };
    if (!mix && patch.coverB === undefined) next.coverB = null;
    onChange(encodeTheme(next));
  };

  async function handleUpload(file: File) {
    if (!user) return;
    setUploadError(null);
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("Please choose an image under 25 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("notebook-covers").upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
      if (error) throw error;
      apply({ image: path });
    } catch (e) {
      setUploadError((e as Error).message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start gap-5">
        {/* Live preview — mirrors the real NotebookCover */}
        <div className="shrink-0">
          <div
            className="marble-base relative h-40 w-32 p-3"
            style={{ background: themeCoverBackground(theme) }}
          >
            {theme.image && (
              <CoverImage
                path={theme.image}
                className="absolute inset-0 h-full w-full"
                style={coverImageStyle(theme)}
              />
            )}
            {!theme.image && (
              <>
                <div className="marble-vein" aria-hidden="true" />
                <div className="marble-speckle" aria-hidden="true" />
              </>
            )}
            <div
              className="absolute inset-y-0 left-0 z-10 w-3"
              style={{ backgroundColor: theme.spine }}
            />
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex-1" />
              <div className="rounded-sm border border-ink-300/70 bg-white/95 px-1.5 py-1 shadow-inner">
                <span className="block truncate font-serif text-[11px] text-ink-900">
                  Notebook label
                </span>
              </div>
            </div>
            <div
              className="absolute bottom-2 right-2 z-0 h-6 w-8 rounded-sm opacity-60 shadow-inner"
              style={{ backgroundColor: theme.page }}
              title="Page color"
            />
          </div>
          <p className="mt-1.5 text-center text-[11px] text-ink-400">
            Preview — left strip is the binder, bottom box is your label
          </p>
        </div>

        <div className="min-w-[260px] flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={mix}
                onChange={(e) => {
                  const on = e.target.checked;
                  setMix(on);
                  onChange(encodeTheme({ ...theme, coverB: on ? theme.coverB || "#F472B6" : null }));
                }}
              />
              Mix two colors
            </label>

            <label className="btn-ghost inline-flex cursor-pointer items-center gap-2 text-sm">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              <span>+ Upload image (up to 25 MB)</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                  e.target.value = "";
                }}
              />
            </label>

            {theme.image && (
              <button
                type="button"
                onClick={() => apply({ image: null })}
                className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-emergency"
              >
                <Trash2 className="h-4 w-4" /> Remove image
              </button>
            )}
            {saving && <span className="text-xs text-ink-400">Saving…</span>}
          </div>
          {uploadError && <p className="mt-2 text-sm text-emergency">{uploadError}</p>}

          {theme.image && (
            <div className="mt-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
                Image size — {Math.round(theme.imageScale ?? 100)}%
              </span>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={300}
                  step={5}
                  value={Math.round(theme.imageScale ?? 100)}
                  onChange={(e) => apply({ imageScale: Number(e.target.value) })}
                  className="w-full max-w-xs accent-rose-500"
                  aria-label="Cover image size"
                />
                <button
                  type="button"
                  onClick={() => apply({ imageScale: 100 })}
                  className="text-xs text-ink-500 underline"
                >
                  Reset
                </button>
              </div>
              <p className="mt-1 text-[11px] text-ink-400">
                Drag to zoom your photo in or out until it fits the cover.
              </p>
            </div>
          )}

          <ColorRow label="Cover" value={theme.coverA} onChange={(v) => apply({ coverA: v })} />
          {mix && (
            <ColorRow
              label="Cover blend"
              value={theme.coverB || "#F472B6"}
              onChange={(v) => apply({ coverB: v })}
            />
          )}
          <ColorRow label="Binder / spine" value={theme.spine} onChange={(v) => apply({ spine: v })} />
          <ColorRow label="Pages" value={theme.page} onChange={(v) => apply({ page: v })} />
        </div>
      </div>

      <div className="mt-5">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
          Or pick a design
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {COVER_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              title={p.label}
              aria-label={`Select ${p.label} cover`}
              className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border-2 transition ${
                value === p.id ? "border-ink-900 scale-110" : "border-transparent"
              }`}
              style={{ backgroundImage: p.preview }}
            >
              <span className="rounded-full bg-white/70 px-1 text-xs" aria-hidden="true">
                {p.emoji}
              </span>
            </button>
          ))}
        </div>
        {isPreset(value) && (
          <p className="mt-2 text-xs text-ink-400">
            Using the {COVER_PRESETS.find((p) => p.id === value)?.label} design. Pick any color above to
            switch back to custom colors.
          </p>
        )}
      </div>
    </div>
  );
}
