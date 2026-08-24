import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createEntry } from "@/lib/notebooks.functions";
import { PenLine } from "lucide-react";
const MOODS: { emoji: string; label: string }[] = [
  { emoji: "😌", label: "Calm" },
  { emoji: "🙂", label: "Okay" },
  { emoji: "😊", label: "Happy" },
  { emoji: "🥰", label: "Loved" },
  { emoji: "🤗", label: "Supported" },
  { emoji: "🙏", label: "Grateful" },
  { emoji: "✨", label: "Inspired" },
  { emoji: "🌟", label: "Hopeful" },
  { emoji: "💪", label: "Strong" },
  { emoji: "🔥", label: "Fierce" },
  { emoji: "🦋", label: "Free" },
  { emoji: "🌱", label: "Growing" },
  { emoji: "❤️‍🩹", label: "Healing" },
  { emoji: "🤍", label: "Peaceful" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😢", label: "Hurting" },
  { emoji: "💔", label: "Broken" },
  { emoji: "😶", label: "Numb" },
  { emoji: "🌫️", label: "Empty" },
  { emoji: "😴", label: "Exhausted" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😨", label: "Scared" },
  { emoji: "😱", label: "Terrified" },
  { emoji: "🤯", label: "Overwhelmed" },
  { emoji: "😵‍💫", label: "Confused" },
  { emoji: "🌀", label: "Lost" },
  { emoji: "😠", label: "Angry" },
  { emoji: "🤬", label: "Furious" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😒", label: "Annoyed" },
  { emoji: "😞", label: "Disappointed" },
  { emoji: "😩", label: "Defeated" },
  { emoji: "😣", label: "Struggling" },
  { emoji: "🥺", label: "Vulnerable" },
  { emoji: "😳", label: "Embarrassed" },
  { emoji: "😬", label: "Worried" },
  { emoji: "😮", label: "Shocked" },
  { emoji: "😲", label: "Surprised" },
  { emoji: "🤔", label: "Thoughtful" },
  { emoji: "🤫", label: "Quiet" },
  { emoji: "🌙", label: "Reflective" },
  { emoji: "💭", label: "Daydreaming" },
  { emoji: "🕊️", label: "Safe" },
  { emoji: "⚠️", label: "Unsafe" },
  { emoji: "🔗", label: "Trapped" },
  { emoji: "🤢", label: "Sick" },
];


interface EntryEditorProps {
  notebookId: string;
  onAdded?: () => void;
}

export function EntryEditor({ notebookId, onAdded }: EntryEditorProps) {
  const queryClient = useQueryClient();
  const create = useServerFn(createEntry);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("");

  const mutation = useMutation({
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries", notebookId] });
      setContent("");
      setMood("");
      onAdded?.();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!content.trim()) return;
        mutation.mutate({ data: { notebookId, content: content.trim(), mood: mood || undefined } });
      }}
      className="note-card p-5"
    >
      <div className="flex items-center gap-2 text-ink-500">
        <PenLine className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-widest">New page</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="paper-lines mt-3 min-h-[12rem] w-full resize-y rounded-xl border border-ink-300 bg-white p-4 text-ink-900 focus-ring-warm"
        placeholder="Write what you need to say. No one can see this unless you choose to share it."
        maxLength={20000}
        required
      />
      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
          How are you feeling?
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const active = mood === `${m.emoji} ${m.label}`;
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => setMood(active ? "" : `${m.emoji} ${m.label}`)}
                aria-pressed={active}
                title={m.label}
                className={`rounded-full border px-3 py-1.5 text-sm transition focus-ring-warm ${
                  active
                    ? "border-rose-500 bg-rose-50 text-ink-900"
                    : "border-ink-300 bg-white text-ink-700 hover:bg-ink-100"
                }`}
              >
                <span className="mr-1 text-base">{m.emoji}</span>
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="input-soft w-56"
          placeholder="Mood (optional)"
          maxLength={32}
        />

        <button type="submit" disabled={mutation.isPending} className="btn-rose">
          {mutation.isPending ? "Saving…" : "Save to notebook"}
        </button>
      </div>
      {mutation.error && (
        <p className="mt-3 text-sm text-emergency">{(mutation.error as Error).message}</p>
      )}
    </form>
  );
}
