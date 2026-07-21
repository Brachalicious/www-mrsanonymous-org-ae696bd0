import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyNotebooks, createNotebook, deleteNotebook } from "@/lib/notebooks.functions";
import { NotebookCover } from "./NotebookCover";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";

const PRESET_COLORS = [
  "#B91C1C",
  "#1E3A8A",
  "#065F46",
  "#7C2D12",
  "#4C1D95",
  "#831843",
  "#134E4A",
  "#3730A3",
];

export function NotebookList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fetchNotebooks = useServerFn(listMyNotebooks);
  const create = useServerFn(createNotebook);
  const remove = useServerFn(deleteNotebook);

  const [title, setTitle] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [open, setOpen] = useState(false);

  const { data: notebooks = [], isLoading } = useQuery({
    queryKey: ["my-notebooks"],
    queryFn: fetchNotebooks,
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-notebooks"] });
      setTitle("");
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-notebooks"] }),
  });

  if (!user) {
    return (
      <div className="note-card p-8 text-center">
        <p className="text-ink-700">
          You need an anonymous account to keep private notebooks.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link to="/login" className="btn-rose">
            Log in
          </Link>
          <Link to="/signup" className="btn-ghost">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="note-card h-52 w-40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl text-ink-900">My Private Notebooks</h2>
        <button
          onClick={() => setOpen((o) => !o)}
          className="btn-rose inline-flex items-center gap-2"
          aria-expanded={open}
        >
          <Plus className="h-4 w-4" />
          New notebook
        </button>
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            createMutation.mutate({ data: { title: title.trim(), color } });
          }}
          className="note-card mb-8 p-5"
        >
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-soft mt-1.5 w-full"
              placeholder="e.g. What I cannot say out loud"
              maxLength={120}
              required
              autoFocus
            />
          </label>
          <div className="mt-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Cover color</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition ${color === c ? "border-ink-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={createMutation.isPending} className="btn-rose">
              {createMutation.isPending ? "Creating…" : "Create notebook"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
          {createMutation.error && (
            <p className="mt-3 text-sm text-emergency">{(createMutation.error as Error).message}</p>
          )}
        </form>
      )}

      {notebooks.length === 0 ? (
        <div className="note-card p-8 text-center">
          <p className="text-ink-700">No notebooks yet. Create one to start writing privately.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-6">
          {notebooks.map((n, i) => (
            <div key={n.id} className="relative">
              <NotebookCover
                id={n.id}
                title={n.title}
                color={n.color}
                entryCount={(n as unknown as { entry_count: number }).entry_count}
                shared={n.shared}
                shareAs={n.share_as}
                jitter={-1.5 + (i % 3) * 1.5}
              />
              <button
                onClick={() => {
                if (confirm("Delete this notebook and all its pages? This cannot be undone.")) {
                    deleteMutation.mutate({ data: { id: n.id } });
                  }
                }}
                className="absolute -right-2 -top-2 rounded-full border border-ink-300 bg-white p-1.5 text-ink-500 shadow-sm hover:text-emergency"
                aria-label="Delete notebook"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
