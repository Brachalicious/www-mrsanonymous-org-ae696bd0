import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Lock, Globe, Pencil } from "lucide-react";
import { getCoverStyle, decodeTheme, isTheme, coverImageStyle } from "@/lib/notebook-covers";
import { CoverImage } from "./CoverImage";

interface NotebookCoverProps {
  id: string;
  title: string;
  color: string;
  entryCount?: number;
  shared?: boolean;
  shareAs?: string;
  jitter?: number;
  /** When set, the label box becomes clickable to rename the notebook. */
  onRename?: (id: string, title: string) => void;
  renaming?: boolean;
}

export function NotebookCover({
  id,
  title,
  color,
  entryCount = 0,
  shared = false,
  shareAs = "anonymous",
  jitter = 0,
  onRename,
  renaming = false,
}: NotebookCoverProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const { className, style } = getCoverStyle(color);
  const theme = decodeTheme(color);
  const themed = isTheme(color);
  return (
    <Link
      to="/notebooks/$id"
      params={{ id }}
      className="notebook-card-wrap group block"
      style={{ ["--jitter" as string]: `${jitter}deg` }}
    >
      <div
        className={`marble-base ${className} relative h-52 w-40 p-5 text-white`}
        style={style}
      >
        {themed && theme.image && (
          <CoverImage
            path={theme.image}
            className="absolute inset-0 h-full w-full"
            style={coverImageStyle(theme)}
          />
        )}
        {themed && !theme.image && (
          <>
            <div className="marble-vein" aria-hidden="true" />
            <div className="marble-speckle" aria-hidden="true" />
          </>
        )}
        {themed && (
          <div className="absolute inset-y-0 left-0 z-10 w-3" style={{ backgroundColor: theme.spine }} />
        )}
        <div className="notebook-tape" />
        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-start justify-between">
            <BookOpen className="h-5 w-5 opacity-80" />
            {shared ? (
              <Globe className="h-4 w-4 opacity-80" aria-label="Shared" />
            ) : (
              <Lock className="h-4 w-4 opacity-80" aria-label="Private" />
            )}
          </div>
          <div className="mt-2 flex-1 text-xs opacity-80">
            <span>
              {entryCount} {entryCount === 1 ? "page" : "pages"}
            </span>
            {shared && <span className="ml-2 capitalize">· {shareAs}</span>}
          </div>
          {/* Composition-book label box — click to rename when editable */}
          <div className="mt-auto">
            {editing ? (
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const next = draft.trim();
                    setEditing(false);
                    if (next && next !== title) onRename?.(id, next);
                  }
                  if (e.key === "Escape") {
                    setDraft(title);
                    setEditing(false);
                  }
                }}
                onBlur={() => {
                  const next = draft.trim();
                  setEditing(false);
                  if (next && next !== title) onRename?.(id, next);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="w-full rounded-sm border border-ink-300 bg-white/95 px-2 py-1.5 font-serif text-sm text-ink-900 shadow-inner outline-none focus:ring-2 focus:ring-rose-400"
                maxLength={120}
                autoFocus
                aria-label="Notebook label"
                disabled={renaming}
              />
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  if (!onRename) return;
                  e.preventDefault();
                  e.stopPropagation();
                  setDraft(title);
                  setEditing(true);
                }}
                className={`group/label block w-full rounded-sm border border-ink-300/70 bg-white/95 px-2 py-1.5 text-left shadow-inner ${
                  onRename ? "cursor-text hover:ring-2 hover:ring-rose-300" : "cursor-pointer"
                }`}
                title={onRename ? "Click to label this notebook" : undefined}
                aria-label={onRename ? `Rename notebook ${title}` : undefined}
              >
                <span className="flex items-center justify-between gap-1">
                  <span className="font-serif text-sm leading-snug text-ink-900 line-clamp-2">
                    {title}
                  </span>
                  {onRename && (
                    <Pencil className="h-3 w-3 shrink-0 text-ink-400 opacity-0 transition group-hover/label:opacity-100" />
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
