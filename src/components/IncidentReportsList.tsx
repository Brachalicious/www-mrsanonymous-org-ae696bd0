import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { listJournalEntries } from "@/lib/journal.functions";
import { buildReportText, downloadReport, shareReport } from "@/lib/incident-report";

type Attachment = { path: string; name: string; type: string; size: number };
type Entry = {
  id: string;
  audience: string;
  fields: Record<string, string>;
  attachments: Attachment[];
  audio_path: string | null;
  created_at: string;
};

const LABELS: Record<string, string> = {
  incidentType: "Type of incident",
  day: "Day",
  date: "Date",
  time: "Time",
  location: "Location",
  involved: "Person(s) involved",
  happened: "What happened",
  injuries: "Injuries / physical effects",
  feel: "Emotional impact",
  witnesses: "Witnesses",
  evidence: "Evidence saved",
  reported: "Reported to",
  chatLog: "Saved conversations",
};

function toText(entry: Entry) {
  const fieldDefs = Object.keys(entry.fields ?? {}).map((k) => ({ key: k, label: LABELS[k] ?? k }));
  return buildReportText({
    fields: entry.fields ?? {},
    fieldDefs,
    createdAt: entry.created_at,
    attachments: entry.attachments ?? [],
    hasAudio: Boolean(entry.audio_path),
  });
}

export function IncidentReportsList() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }
    (async () => {
      try {
        setEntries((await listJournalEntries()) as unknown as Entry[]);
      } catch {
        /* ignore */
      }
    })();
  }, [user?.id]);

  if (!user) return null;

  return (
    <section aria-label="My incident reports" className="mt-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl text-ink-900">My incident reports</h2>
        <Link
          to="/journal"
          className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
        >
          + Document an incident
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="note-card p-5 text-sm text-ink-600">
          No saved reports yet. Documenting an incident keeps a private, timestamped record only you can open.
        </div>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => {
            const open = openId === e.id;
            const preview = Object.values(e.fields ?? {}).find((v) => v?.trim()) ?? "Report";
            const text = toText(e);
            return (
              <li key={e.id} className="note-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : e.id)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">
                      {new Date(e.created_at).toLocaleString()}
                    </span>
                    <span className="block truncate text-sm text-ink-600">{preview.slice(0, 90)}</span>
                  </span>
                  <span className="text-ink-500">{open ? "▲" : "▼"}</span>
                </button>
                {open && (
                  <div className="border-t border-ink-200 p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-ink-700">{text}</pre>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => downloadReport(text, e.created_at)}
                        className="rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-cream-50"
                      >
                        📄 Download report
                      </button>
                      <button
                        type="button"
                        onClick={async () => setStatus(await shareReport(text, e.created_at))}
                        className="rounded-full border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-cream-100"
                      >
                        ↗ Share report
                      </button>
                      <Link
                        to="/journal"
                        className="rounded-full border border-ink-300 px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-cream-100"
                      >
                        Open in journal
                      </Link>
                    </div>
                    {status && <p className="mt-2 text-xs text-ink-500">{status}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
