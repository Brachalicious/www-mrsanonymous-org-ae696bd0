import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSharedStories, sendReaction, storyReactions } from "@/lib/stories.functions";
import { Eye, EyeOff, AlertTriangle, Flag, Ban } from "lucide-react";
import { reportStory, blockStoryAuthor, REPORT_REASONS } from "@/lib/moderation.functions";

export function StoriesBoard() {
  const queryClient = useQueryClient();
  const fetchStories = useServerFn(listSharedStories);
  const react = useServerFn(sendReaction);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["shared-stories"],
    queryFn: fetchStories,
  });

  const mutation = useMutation({
    mutationFn: react,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shared-stories"] });
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="note-card h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="note-card p-8 text-center">
        <p className="text-ink-700">
          No stories have been shared yet. When someone chooses to share their notebook, it will appear here — blurred by default.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {stories.map((story, i) => (
        <StoryCard
          key={story.id}
          story={story}
          index={i}
          onReact={(reaction) => mutation.mutate({ data: { notebookId: story.id, reaction } })}
        />
      ))}
    </div>
  );
}

function StoryModeration({ notebookId }: { notebookId: string }) {
  const queryClient = useQueryClient();
  const submitReport = useServerFn(reportStory);
  const blockAuthor = useServerFn(blockStoryAuthor);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return <p className="mt-4 text-xs text-ink-500">{done}</p>;
  }

  return (
    <div className="mt-4 border-t border-ink-200 pt-3">
      {!open ? (
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-rose-600"
          >
            <Flag className="h-3.5 w-3.5" /> Report
          </button>
          <button
            onClick={async () => {
              await blockAuthor({ data: { notebookId } });
              await queryClient.invalidateQueries({ queryKey: ["shared-stories"] });
              setDone("You will no longer see stories from this person.");
            }}
            className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-rose-600"
          >
            <Ban className="h-3.5 w-3.5" /> Block this person
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-ink-700">Why are you reporting this?</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm"
          >
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={2}
            placeholder="Anything else we should know? (optional)"
            className="w-full rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await submitReport({ data: { notebookId, reason, details: details || undefined } });
                await queryClient.invalidateQueries({ queryKey: ["shared-stories"] });
                setDone("Thank you. Our team reviews reports within 24 hours.");
              }}
              className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-600"
            >
              Send report
            </button>
            <button onClick={() => setOpen(false)} className="text-xs text-ink-500 hover:text-ink-700">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const PIN_COLORS = [
  { head: "#dc2626", shine: "#fca5a5" },
  { head: "#111111", shine: "#6b7280" },
  { head: "#ffffff", shine: "#e5e7eb" },
];

function PushPin({ index }: { index: number }) {
  const c = PIN_COLORS[index % PIN_COLORS.length];
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -top-3 left-1/2 z-10 h-7 w-7 -translate-x-1/2 rounded-full border border-black/25 shadow-[0_4px_8px_rgba(0,0,0,0.45)]"
      style={{ background: `radial-gradient(circle at 32% 30%, ${c.shine}, ${c.head} 65%)` }}
    />
  );
}

function StoryCard({
  story,
  index,
  onReact,
}: {
  story: Awaited<ReturnType<typeof listSharedStories>>[number];
  index: number;
  onReact: (reaction: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const tilt = [-1.5, 1.2, -0.8, 1.8][index % 4];

  return (
    <article
      className="torn-page relative flex flex-col pt-4"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <PushPin index={index} />
      <div className="safety-callout flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
        <p className="text-sm text-ink-700">
          This may contain details about abuse. Tap to read when you feel ready.
        </p>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
            {story.author}
          </span>
          <button
            onClick={() => setRevealed((r) => !r)}
            className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700"
            aria-label={revealed ? "Blur story" : "Reveal story"}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {revealed ? "Blur" : "Reveal"}
          </button>
        </div>
        <div className={revealed ? "" : "blur-story"} data-revealed={revealed}>
          <h3 className="mt-3 font-serif text-xl text-ink-900">{story.title}</h3>
          <p className="mt-3 whitespace-pre-line text-ink-700 leading-relaxed">
            {story.preview}
            {story.preview.length >= 240 && "…"}
          </p>
        </div>

        {story.topics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {story.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-ink-300 bg-cream-100 px-2.5 py-1 text-xs text-ink-700"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {story.reactions.map((r) => (
            <button
              key={r.key}
              onClick={() => onReact(r.key)}
              className="reaction-chip"
              data-active={r.active}
              aria-pressed={r.active}
            >
              <span>{r.emoji}</span>
              <span>{r.label}</span>
              <span className="text-ink-500">{r.count}</span>
            </button>
          ))}
        </div>

        <StoryModeration notebookId={story.id} />
      </div>
    </article>
  );
}
