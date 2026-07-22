import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  getNotebook,
  listEntries,
  createEntry,
  updateNotebook,
  shareNotebook,
  shareEntry,
} from "@/lib/notebooks.functions";
import { useAuth } from "@/contexts/AuthContext";
import { EntryEditor } from "@/components/EntryEditor";
import { ArrowLeft, Lock, Globe, Share2, BookOpen, Palette, Check, X } from "lucide-react";
import { getCoverStyle, COVER_PRESETS, isPreset } from "@/lib/notebook-covers";

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

const MAX_TOPICS = 8;
const TOPIC_OPTIONS = [
  "Sexual abuse",
  "Physical abuse",
  "Emotional / verbal abuse",
  "Financial abuse",
  "Neglect",
  "Abandonment",
  "Coercive control",
  "Stalking / harassment",
  "Childhood abuse",
  "Trafficking / exploitation",
  "Spiritual / religious abuse",
  "Other",
];

export const Route = createFileRoute("/notebooks/$id")({
  head: () => ({
    meta: [
      { title: "My Notebook — MrsANONymous.org" },
      { name: "description", content: "A private notebook on MrsANONymous. Your words, your choice." },
    ],
  }),
  component: NotebookDetailPage,
});

function NotebookDetailPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fetchNotebook = useServerFn(getNotebook);
  const fetchEntries = useServerFn(listEntries);
  const create = useServerFn(createEntry);
  const update = useServerFn(updateNotebook);
  const shareNb = useServerFn(shareNotebook);
  const shareEn = useServerFn(shareEntry);

  const [newTitle, setNewTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingCover, setEditingCover] = useState(false);

  const {
    data: notebook,
    isLoading: nbLoading,
    error: nbError,
  } = useQuery({
    queryKey: ["notebook", id],
    queryFn: () => fetchNotebook({ data: { id } }),
    enabled: !!user,
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ["entries", id],
    queryFn: () => fetchEntries({ data: { id } }),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notebook", id] }),
  });

  const shareNotebookMutation = useMutation({
    mutationFn: shareNb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook", id] });
      queryClient.invalidateQueries({ queryKey: ["shared-stories"] });
    },
  });

  const shareEntryMutation = useMutation({
    mutationFn: shareEn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entries", id] }),
  });

  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entries", id] }),
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 lg:px-10 text-center">
        <h1 className="font-serif text-3xl text-ink-900">This notebook is private</h1>
        <p className="mt-4 text-ink-600">Log in to view your notebooks.</p>
        <Link to="/login" className="btn-rose mt-6 inline-block">
          Log in
        </Link>
      </div>
    );
  }

  if (nbLoading || entriesLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 lg:px-10">
        <div className="note-card h-96 animate-pulse" />
      </div>
    );
  }

  if (nbError || !notebook) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 lg:px-10">
        <div className="note-card p-8 text-center">
          <p className="text-emergency">Could not load this notebook. It may not exist or belong to another account.</p>
          <Link to="/tell-your-story" search={{ tab: "mine" }} className="btn-rose mt-4 inline-block">
            Back to my notebooks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-10">
      <Link
        to="/tell-your-story"
        search={{ tab: "mine" }}
        className="mb-6 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-rose-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my notebooks
      </Link>

      <div
        className={`marble-base ${getCoverStyle(notebook.color).className} relative mb-8 overflow-hidden rounded-3xl p-8 text-white`}
        style={getCoverStyle(notebook.color).style}
      >
        <div className="notebook-tape" />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <BookOpen className="h-6 w-6 opacity-80" />
            {notebook.shared ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Globe className="h-3 w-3" />
                Shared as {notebook.share_as}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Lock className="h-3 w-3" />
                Private
              </span>
            )}
          </div>

          {editingTitle ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newTitle.trim() && newTitle.trim() !== notebook.title) {
                  updateMutation.mutate({ data: { id, title: newTitle.trim() } });
                }
                setEditingTitle(false);
              }}
              className="mt-4 flex gap-2"
            >
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 rounded-xl border border-white/40 bg-white/20 px-3 py-2 text-2xl font-serif text-white placeholder-white/60 focus-ring-warm"
                autoFocus
                maxLength={120}
              />
              <button type="submit" className="rounded-xl bg-white/30 px-3 text-white hover:bg-white/40" aria-label="Save title">
                <Check className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setEditingTitle(false)} className="rounded-xl bg-white/20 px-3 text-white hover:bg-white/30" aria-label="Cancel">
                <X className="h-5 w-5" />
              </button>
            </form>
          ) : (
            <div className="mt-4 flex items-center gap-3">
              <h1
                onClick={() => {
                  setNewTitle(notebook.title);
                  setEditingTitle(true);
                }}
                className="cursor-pointer font-serif text-3xl hover:underline"
                title="Click to rename"
              >
                {notebook.title}
              </h1>
              <button
                onClick={() => setEditingCover((v) => !v)}
                className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-white/30"
              >
                <Palette className="h-3 w-3" />
                {editingCover ? "Done" : "Change cover"}
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {notebook.topics?.map((topic) => (
              <span key={topic} className="rounded-full bg-white/20 px-2.5 py-1 text-xs backdrop-blur">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {editingCover && (
        <div className="note-card mb-6 p-5">
          <h3 className="font-serif text-lg text-ink-900">Choose a cover</h3>
          <div className="mt-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Cover designs</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {COVER_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => updateMutation.mutate({ data: { id, color: p.id } })}
                  title={p.label}
                  aria-label={`Select ${p.label} cover`}
                  className={`h-10 w-10 overflow-hidden rounded-lg border-2 flex items-center justify-center transition ${
                    notebook.color === p.id ? "border-ink-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundImage: p.preview }}
                >
                  <span className="rounded-full bg-white/70 px-1 text-xs" aria-hidden="true">
                    {p.emoji}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Solid colors</span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateMutation.mutate({ data: { id, color: c } })}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    notebook.color === c ? "border-ink-900 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
              <label
                className={`relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 ${
                  !isPreset(notebook.color) && !PRESET_COLORS.includes(notebook.color)
                    ? "border-ink-900 scale-110"
                    : "border-ink-300"
                }`}
                title="Pick any color"
                style={{
                  background:
                    "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                }}
              >
                <input
                  type="color"
                  value={isPreset(notebook.color) ? "#B91C1C" : notebook.color}
                  onChange={(e) => updateMutation.mutate({ data: { id, color: e.target.value } })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Custom color picker"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      <SharePanel
        notebook={notebook}
        onShare={(shared, shareAs, topics) =>
          shareNotebookMutation.mutate({ data: { id, shared, shareAs, topics } })
        }
      />

      <div className="mt-10">
        <h2 className="mb-5 font-serif text-2xl text-ink-900">Pages</h2>
        <EntryEditor notebookId={id} />

        <div className="mt-8 space-y-6">
          {entries.length === 0 && (
            <p className="text-center text-ink-500">No pages yet. Write your first one above.</p>
          )}
          {entries.map((entry) => (
            <article key={entry.id} className="note-card p-5">
              <div className="flex items-start justify-between">
                <div className="text-xs text-ink-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                  {entry.mood && <span className="ml-2">· {entry.mood}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {entry.shared ? (
                    <span className="inline-flex items-center gap-1 text-xs text-rose-600">
                      <Globe className="h-3 w-3" />
                      Shared as {entry.share_as}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-ink-500">
                      <Lock className="h-3 w-3" />
                      Private
                    </span>
                  )}
                  <button
                    onClick={() =>
                      shareEntryMutation.mutate({
                        data: {
                          id: entry.id,
                          shared: !entry.shared,
                          shareAs: entry.share_as || "anonymous",
                          topics: notebook.topics || [],
                        },
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-ink-300 bg-white px-2.5 py-1 text-xs hover:bg-cream-100"
                    title={entry.shared ? "Make private" : "Rip out and share to board"}
                  >
                    <Share2 className="h-3 w-3" />
                    {entry.shared ? "Unshare" : "Rip out"}
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-ink-800 leading-relaxed">{entry.content}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function SharePanel({
  notebook,
  onShare,
}: {
  notebook: Awaited<ReturnType<typeof getNotebook>>;
  onShare: (shared: boolean, shareAs: "nickname" | "anonymous", topics: string[]) => void;
}) {
  const [shareAs, setShareAs] = useState<"nickname" | "anonymous">(notebook.share_as as "nickname" | "anonymous");
  const [topics, setTopics] = useState<string[]>(notebook.topics || []);

  return (
    <div className="note-card p-5">
      <div className="flex items-center gap-2">
        <Share2 className="h-4 w-4 text-rose-600" />
        <h3 className="font-serif text-lg text-ink-900">Sharing</h3>
      </div>
      <p className="mt-2 text-sm text-ink-600">
        Sharing a notebook puts it on the community board. You can keep it anonymous or use your nickname.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="radio"
            name="shareAs"
            value="anonymous"
            checked={shareAs === "anonymous"}
            onChange={() => setShareAs("anonymous")}
          />
          Anonymous
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="radio"
            name="shareAs"
            value="nickname"
            checked={shareAs === "nickname"}
            onChange={() => setShareAs("nickname")}
          />
          My nickname
        </label>
      </div>

      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Topics (max {MAX_TOPICS})</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {TOPIC_OPTIONS.map((topic) => {
            const selected = topics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                onClick={() => {
                  setTopics((prev) =>
                    selected
                      ? prev.filter((t) => t !== topic)
                      : prev.length < MAX_TOPICS
                      ? [...prev, topic]
                      : prev
                  );
                }}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  selected
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-ink-300 text-ink-700 hover:bg-cream-100"
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        {!notebook.shared ? (
          <button onClick={() => onShare(true, shareAs, topics)} className="btn-rose">
            Share to board
          </button>
        ) : (
          <button onClick={() => onShare(false, shareAs, topics)} className="btn-ghost">
            Stop sharing
          </button>
        )}
      </div>
    </div>
  );
}
