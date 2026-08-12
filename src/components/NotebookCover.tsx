import { Link } from "@tanstack/react-router";
import { BookOpen, Lock, Globe } from "lucide-react";
import { getCoverStyle, decodeTheme, isTheme } from "@/lib/notebook-covers";
import { CoverImage } from "./CoverImage";

interface NotebookCoverProps {
  id: string;
  title: string;
  color: string;
  entryCount?: number;
  shared?: boolean;
  shareAs?: string;
  jitter?: number;
}

export function NotebookCover({
  id,
  title,
  color,
  entryCount = 0,
  shared = false,
  shareAs = "anonymous",
  jitter = 0,
}: NotebookCoverProps) {
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
          <CoverImage path={theme.image} className="absolute inset-0 h-full w-full object-cover" />
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
          <div className="mt-4 flex-1">
            <h3 className="font-serif text-lg leading-tight line-clamp-3">{title}</h3>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs opacity-80">
            <span>
              {entryCount} {entryCount === 1 ? "page" : "pages"}
            </span>
            {shared && <span className="capitalize">{shareAs}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
