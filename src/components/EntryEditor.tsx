import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createEntry } from "@/lib/notebooks.functions";
import { PenLine } from "lucide-react";

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
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="input-soft w-40"
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
