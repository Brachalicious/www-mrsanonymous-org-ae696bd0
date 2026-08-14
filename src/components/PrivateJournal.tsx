import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getEmergency } from "@/lib/emergency-numbers";
import { useRegion } from "@/hooks/use-region";
import {
  buildReportText,
  downloadReport,
  shareReport,
  smsReportHref,
} from "@/lib/incident-report";
import {
  createJournalEntry,
  deleteJournalEntry,
  listJournalEntries,
} from "@/lib/journal.functions";
import { listMyMessages } from "@/lib/contact.functions";
import type { ReportConversation } from "@/lib/incident-report";

type Field = {
  key: string;
  label: string;
  type: "text" | "date" | "time" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

const GIRLS_FIELDS: Field[] = [
  { key: "day", label: "Day (if you remember)", type: "text", placeholder: "e.g. Tuesday" },
  { key: "date", label: "Date (if you remember)", type: "date" },
  { key: "time", label: "Time (if you remember)", type: "time" },
  { key: "location", label: "Where were you?", type: "text", placeholder: "e.g. school bathroom, my room" },
  { key: "involved", label: "Who was involved? (only if you want to say)", type: "text", placeholder: "first name, initial, nickname" },
  { key: "happened", label: "What happened?", type: "textarea" },
  { key: "feel", label: "How did it make you feel?", type: "textarea" },
  { key: "evidence", label: "Any evidence, witnesses, photos, texts, etc.", type: "textarea" },
];

const WOMEN_FIELDS: Field[] = [
  {
    key: "incidentType",
    label: "Type of incident",
    type: "select",
    options: ["Physical", "Emotional", "Verbal", "Financial", "Sexual", "Other"],
  },
  { key: "date", label: "Date of incident", type: "date" },
  { key: "time", label: "Time of incident", type: "time" },
  { key: "location", label: "Location", type: "text", placeholder: "Where did it happen?" },
  { key: "involved", label: "Person(s) involved", type: "text", placeholder: "Initials, relationship, role" },
  { key: "happened", label: "What happened? (be as detailed as feels safe)", type: "textarea" },
  { key: "injuries", label: "Injuries / physical effects", type: "textarea" },
  { key: "feel", label: "Emotional impact", type: "textarea" },
  { key: "witnesses", label: "Witnesses (name, contact if known)", type: "textarea" },
  { key: "evidence", label: "Evidence saved (photos, texts, voicemails, medical records)", type: "textarea" },
  { key: "reported", label: "Was it reported anywhere? (police, doctor, friend)", type: "text" },
];

type Attachment = { path: string; name: string; type: string; size: number };
type Entry = {
  id: string;
  audience: string;
  fields: Record<string, string>;
  attachments: Attachment[];
  audio_path: string | null;
  created_at: string;
};

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const CHAT_FIELD = { key: "chatLog", label: "Saved conversations" };

function emptyFor(fields: Field[]) {
  return fields.reduce<Record<string, string>>((a, f) => ({ ...a, [f.key]: "" }), {});
}

export function PrivateJournal() {
  const { user, profile, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const { country: region } = useRegion();
  const emergency = getEmergency(lang, region);
  const smsNumber = emergency.sms ?? emergency.police;
  const audience: "women" | "girls" = profile?.audience === "girls" ? "girls" : "women";
  const fields = audience === "girls" ? GIRLS_FIELDS : WOMEN_FIELDS;

  const [form, setForm] = useState<Record<string, string>>(() => emptyFor(fields));
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [showEntries, setShowEntries] = useState(false);
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const [chats, setChats] = useState<ReportConversation[]>([]);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm(emptyFor(fields));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audience]);

  async function refresh() {
    if (!user) return;
    try {
      const data = (await listJournalEntries()) as unknown as Entry[];
      setEntries(data);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (user) refresh();
    else setEntries([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }
    (async () => {
      try {
        const rows = (await listMyMessages()) as unknown as {
          id: string;
          message: string;
          created_at: string;
          replies?: { id: string; body: string; created_at: string; fromMe: boolean }[];
        }[];
        setChats(
          rows.map((m) => ({
            title: `Support conversation ${m.id.slice(0, 8)}`,
            createdAt: m.created_at,
            messages: [
              { from: "You", body: m.message, at: m.created_at },
              ...(m.replies ?? []).map((r) => ({
                from: r.fromMe ? "You" : "Support",
                body: r.body,
                at: r.created_at,
              })),
            ],
          })),
        );
      } catch {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const includedChats = chats.filter((c) => selectedChats.includes(c.title));

  function chatTranscript(list: ReportConversation[]) {
    return list
      .map(
        (c) =>
          `${c.title}${c.createdAt ? ` (${new Date(c.createdAt).toLocaleString()})` : ""}\n` +
          c.messages.map((m) => `${m.from}: ${m.body}`).join("\n"),
      )
      .join("\n\n");
  }

  const draftReport = buildReportText({
    fields: form,
    fieldDefs: fields,
    attachments: pendingFiles.map((f) => ({ name: f.name })),
    hasAudio: !!audioBlob,
    conversations: includedChats,
  });
  const hasDraft =
    fields.some((f) => (form[f.key] ?? "").trim().length > 0) || includedChats.length > 0;

  function entryReport(e: Entry) {
    const defs = e.audience === "girls" ? GIRLS_FIELDS : WOMEN_FIELDS;
    return buildReportText({
      fields: e.fields ?? {},
      fieldDefs: [...defs, CHAT_FIELD],
      createdAt: e.created_at,
      attachments: e.attachments ?? [],
      hasAudio: !!e.audio_path,
    });
  }

  async function doShare(text: string, createdAt?: string) {
    const msg = await shareReport(text, createdAt);
    if (msg) setStatus(msg);
  }

  function onPickFiles(list: FileList | null) {
    const picked = Array.from(list ?? []).filter((f) => f.size <= MAX_FILE_BYTES);
    if (picked.length !== (list?.length ?? 0)) setStatus("Some files were skipped (over 25MB).");
    setPendingFiles((p) => [...p, ...picked].slice(0, 20));
  }

  async function startRecording() {
    setStatus("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch {
      setStatus("Could not access the microphone. Permission may be blocked.");
    }
  }

  function stopRecording() {
    try {
      recorderRef.current?.stop();
    } catch {
      /* ignore */
    }
    setRecording(false);
  }

  async function uploadOne(file: Blob, filename: string, contentType: string) {
    if (!user) throw new Error("Please log in again before saving.");

    // Never put the original filename in a storage key. Screenshot names can
    // contain invisible Unicode spaces and punctuation rejected by storage.
    const dot = filename.lastIndexOf(".");
    const ext = (dot > 0 ? filename.slice(dot + 1) : "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 10);
    const path = `${user.id}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;
    const { error } = await supabase.storage.from("evidence").upload(path, file, {
      contentType,
      upsert: false,
    });
    if (error) throw new Error(error.message);
    return path;
  }

  async function save() {
    if (!user) return;
    const hasContent =
      Object.values(form).some((v) => v.trim()) ||
      pendingFiles.length > 0 ||
      audioBlob ||
      includedChats.length > 0;
    if (!hasContent) {
      setStatus("Write something first — even one line counts.");
      return;
    }
    setSaving(true);
    setStatus("Saving…");
    try {
      const attachments: Attachment[] = [];
      for (const f of pendingFiles) {
        const path = await uploadOne(f, f.name, f.type || "application/octet-stream");
        attachments.push({ path, name: f.name, type: f.type || "", size: f.size });
      }
      let audioPath: string | null = null;
      if (audioBlob) audioPath = await uploadOne(audioBlob, "recording.webm", "audio/webm");

      await createJournalEntry({
        data: {
          audience,
          fields: includedChats.length
            ? { ...form, chatLog: chatTranscript(includedChats).slice(0, 8000) }
            : form,
          attachments,
          audioPath,
        },
      });

      setForm(emptyFor(fields));
      setPendingFiles([]);
      setSelectedChats([]);
      setAudioBlob(null);
      setAudioUrl(null);
      setStatus("Saved to your private journal.");
      refresh();
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function openAttachment(path: string) {
    const { data, error } = await supabase.storage.from("evidence").createSignedUrl(path, 300);
    if (error || !data) {
      setStatus("Could not open that file.");
      return;
    }
    window.location.assign(data.signedUrl);
  }

  async function remove(id: string) {
    await deleteJournalEntry({ data: { id } });
    refresh();
  }

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="note-card p-6 text-center">
        <h2 className="font-serif text-2xl text-ink-900">Your private journal</h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-ink-600">
          Documenting incidents — dates, details, photos, voice notes — is stored privately under your
          nickname account. Log in or create an anonymous account to start.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link to="/login" className="btn-ghost">Log in</Link>
          <Link to="/signup" className="btn-rose">Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="note-card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="hand-note text-xl">for your eyes only</span>
            <h2 className="font-serif text-2xl text-ink-900">Document an incident</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowEntries((s) => !s)}
            className="btn-ghost text-xs"
          >
            {showEntries ? "Hide saved entries" : `Saved entries (${entries.length})`}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
              <label htmlFor={`j-${f.key}`} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-500">
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={`j-${f.key}`}
                  rows={4}
                  value={form[f.key] ?? ""}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-xl border border-ink-300 bg-white/70 px-3 py-2 text-sm text-ink-900"
                />
              ) : f.type === "select" ? (
                <select
                  id={`j-${f.key}`}
                  value={form[f.key] ?? ""}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-xl border border-ink-300 bg-white/70 px-3 py-2 text-sm text-ink-900"
                >
                  <option value="">Choose…</option>
                  {(f.options ?? []).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  id={`j-${f.key}`}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key] ?? ""}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full rounded-xl border border-ink-300 bg-white/70 px-3 py-2 text-sm text-ink-900"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-dashed border-ink-300 p-4">
            <h3 className="text-sm font-semibold text-ink-900">📎 Photos & files</h3>
            <p className="mt-1 text-xs text-ink-500">Screenshots, medical records, texts. Max 25MB each.</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onPickFiles(e.target.files)}
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-ghost mt-3 text-xs">
              Add files
            </button>
            {pendingFiles.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-ink-700">
                {pendingFiles.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setPendingFiles((p) => p.filter((_, idx) => idx !== i))}
                      className="text-rose-600"
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-ink-300 p-4">
            <h3 className="text-sm font-semibold text-ink-900">🎙️ Voice note</h3>
            <p className="mt-1 text-xs text-ink-500">Say it out loud if writing is too hard right now.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {recording ? (
                <button type="button" onClick={stopRecording} className="btn-rose text-xs">Stop recording</button>
              ) : (
                <button type="button" onClick={startRecording} className="btn-ghost text-xs">Start recording</button>
              )}
              {audioUrl && (
                <button type="button" onClick={() => { setAudioBlob(null); setAudioUrl(null); }} className="btn-ghost text-xs">
                  Discard
                </button>
              )}
            </div>
            {audioUrl && <audio controls src={audioUrl} className="mt-3 w-full" />}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="btn-rose disabled:opacity-60">
            {saving ? "Saving…" : "Save privately"}
          </button>
          {status && <span className="text-xs text-ink-600">{status}</span>}
        </div>

        <div className="mt-5 rounded-xl border border-ink-300/70 bg-cream-100 p-4">
          <h3 className="text-sm font-semibold text-ink-900">📄 Incident report</h3>
          {chats.length > 0 && (
            <div className="mt-3 rounded-lg border border-ink-300/70 bg-white/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Include saved chats
              </p>
              <ul className="mt-2 space-y-1">
                {chats.map((c) => (
                  <li key={c.title} className="flex items-start gap-2 text-xs text-ink-700">
                    <input
                      id={`chat-${c.title}`}
                      type="checkbox"
                      className="mt-0.5"
                      checked={selectedChats.includes(c.title)}
                      onChange={(ev) =>
                        setSelectedChats((s) =>
                          ev.target.checked ? [...s, c.title] : s.filter((t) => t !== c.title),
                        )
                      }
                    />
                    <label htmlFor={`chat-${c.title}`} className="cursor-pointer">
                      {c.title}
                      {c.createdAt ? ` · ${new Date(c.createdAt).toLocaleDateString()}` : ""} ·{" "}
                      {c.messages.length} messages
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-1 text-xs text-ink-500">
            Turn what you wrote above into a report you can save as a file, share with police,
            an advocate or a lawyer, or text to emergency services.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!hasDraft}
              onClick={() => downloadReport(draftReport)}
              className="rounded-full border border-ink-300 px-3 py-1.5 text-xs text-ink-700 hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-50"
            >
              📄 Download report
            </button>
            <button
              type="button"
              disabled={!hasDraft}
              onClick={() => doShare(draftReport)}
              className="rounded-full border border-ink-300 px-3 py-1.5 text-xs text-ink-700 hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-50"
            >
              ↗ Share report
            </button>
            {emergency.smsSupported && (
              <a
                href={hasDraft ? smsReportHref(smsNumber, draftReport) : undefined}
                aria-disabled={!hasDraft}
                className={`rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-700 ${
                  hasDraft ? "" : "pointer-events-none opacity-50"
                }`}
              >
                Text {smsNumber}
              </a>
            )}
          </div>
          <p className="mt-2 text-[11px] text-ink-400">
            Texting emergency services isn’t available everywhere. If you’re in danger, call{" "}
            {emergency.policeLabel}.
          </p>
        </div>
      </div>

      {showEntries && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl text-ink-900">Saved entries</h3>
          {entries.length === 0 && <p className="text-sm text-ink-500">Nothing saved yet.</p>}
          {entries.map((e) => {
            const isOpen = openEntryId === e.id;
            const firstLine = Object.values(e.fields ?? {})
              .map((v) => (v ?? "").toString().trim())
              .find((v) => v.length > 0);
            return (
              <article key={e.id} className="note-card overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => setOpenEntryId((id) => (id === e.id ? null : e.id))}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-cream-100/50"
                >
                  <div className="min-w-0">
                    <span className="text-xs uppercase tracking-widest text-ink-500">
                      {new Date(e.created_at).toLocaleString()}
                    </span>
                    <p className="mt-0.5 truncate text-sm text-ink-700">
                      {firstLine ? firstLine.slice(0, 90) : "Tap to view saved entry"}
                    </p>
                  </div>
                  <span className="shrink-0 text-lg text-ink-400" aria-hidden="true">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-ink-200/60 p-5">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadReport(entryReport(e), e.created_at)}
                        className="rounded-full border border-ink-300 px-3 py-1 text-xs text-ink-700 hover:bg-cream-100"
                      >
                        📄 Download report
                      </button>
                      <button
                        type="button"
                        onClick={() => doShare(entryReport(e), e.created_at)}
                        className="rounded-full border border-ink-300 px-3 py-1 text-xs text-ink-700 hover:bg-cream-100"
                      >
                        ↗ Share
                      </button>
                      {emergency.smsSupported && (
                        <a
                          href={smsReportHref(smsNumber, entryReport(e))}
                          className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-700"
                        >
                          Text {smsNumber}
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(e.id)}
                        className="ml-auto text-xs text-rose-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                    <dl className="space-y-2 text-sm">
                      {[...(e.audience === "girls" ? GIRLS_FIELDS : WOMEN_FIELDS), CHAT_FIELD].map((f) => {
                        const v = (e.fields?.[f.key] ?? "").trim();
                        if (!v) return null;
                        return (
                          <div key={f.key}>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">{f.label}</dt>
                            <dd className="whitespace-pre-wrap text-ink-800">{v}</dd>
                          </div>
                        );
                      })}
                    </dl>
                    {(e.attachments ?? []).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(e.attachments ?? []).map((a) => (
                          <button
                            key={a.path}
                            type="button"
                            onClick={() => openAttachment(a.path)}
                            className="rounded-full border border-ink-300 px-3 py-1 text-xs text-ink-700 hover:bg-cream-100"
                          >
                            📎 {a.name}
                          </button>
                        ))}
                      </div>
                    )}
                    {e.audio_path && (
                      <button
                        type="button"
                        onClick={() => openAttachment(e.audio_path!)}
                        className="mt-3 rounded-full border border-ink-300 px-3 py-1 text-xs text-ink-700 hover:bg-cream-100"
                      >
                        🎙️ Play voice note
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}