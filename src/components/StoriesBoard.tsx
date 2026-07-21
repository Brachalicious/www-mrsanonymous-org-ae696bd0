import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSharedStories, sendReaction, storyReactions } from "@/lib/stories.functions";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} onReact={(reaction) => mutation.mutate({ data: { notebookId: story.id, reaction } })} />
      ))}
    </div>
  );
}

function StoryCard({
  story,
  onReact,
}: {
  story: Awaited<ReturnType<typeof listSharedStories>>[number];
  onReact: (reaction: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <article className="note-card flex flex-col overflow-hidden">
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
      </div>
    </article>
  );
}
