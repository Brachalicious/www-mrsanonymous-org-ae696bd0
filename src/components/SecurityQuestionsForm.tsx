import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";

export const SUGGESTED_QUESTIONS = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What was your childhood nickname?",
  "What is the name of the street you grew up on?",
  "What was the make of your first car?",
  "What is your favourite book?",
  "What was the name of your first school?",
  "What is your mother's maiden name?",
  "What was your favourite childhood toy?",
  "Who was your favourite teacher?",
];

export interface SecurityAnswers {
  question_1: string;
  question_2: string;
  question_3: string;
  answer_1: string;
  answer_2: string;
  answer_3: string;
}

interface Props {
  onSubmit: (values: SecurityAnswers) => Promise<void> | void;
  submitLabel?: string;
  loading?: boolean;
  error?: string;
  note?: string;
}

export function SecurityQuestionsForm({ onSubmit, submitLabel = "Save recovery questions", loading, error, note }: Props) {
  const [q1, setQ1] = useState(SUGGESTED_QUESTIONS[0]);
  const [q2, setQ2] = useState(SUGGESTED_QUESTIONS[1]);
  const [q3, setQ3] = useState(SUGGESTED_QUESTIONS[2]);
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [a3, setA3] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      question_1: q1,
      question_2: q2,
      question_3: q3,
      answer_1: a1,
      answer_2: a2,
      answer_3: a3,
    });
  }

  const rows: [string, (v: string) => void, string, (v: string) => void, string][] = [
    [q1, setQ1, a1, setA1, "sec-1"],
    [q2, setQ2, a2, setA2, "sec-2"],
    [q3, setQ3, a3, setA3, "sec-3"],
  ];

  return (
    <form onSubmit={submit} className="note-card space-y-6 p-7">
      {note && <p className="text-sm text-ink-700">{note}</p>}

      {rows.map(([q, setQ, a, setA, key], idx) => (
        <div key={key} className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
            Question {idx + 1}
          </span>
          <select
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-xl border border-ink-300/40 bg-cream-100 px-3 py-2 text-sm text-ink-900"
            data-testid={`${key}-select`}
          >
            {SUGGESTED_QUESTIONS.map((sq) => (
              <option key={sq} value={sq}>
                {sq}
              </option>
            ))}
            <option value={q.startsWith("__custom__") ? q : "__custom__"}>Write my own…</option>
          </select>
          {q === "__custom__" || q.startsWith("__custom__") ? (
            <input
              value={q.replace(/^__custom__/, "")}
              onChange={(e) => setQ(`__custom__${e.target.value}`)}
              placeholder="Type your own question"
              className="input-soft"
              data-testid={`${key}-custom`}
            />
          ) : null}
          <PasswordInput
            testid={`${key}-answer`}
            value={a}
            onChange={(e) => setA(e.target.value)}
            name={`security-answer-${idx + 1}`}
            placeholder="Your answer"
          />
        </div>
      ))}

      {error && (
        <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency" data-testid="sec-error">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-rose w-full" data-testid="sec-submit">
        {loading ? "Saving…" : submitLabel}
      </button>

      <p className="text-[11px] leading-relaxed text-ink-500">
        Answers are case-insensitive and stored as one-way hashes — we can never read them. If you forget your
        answers there is no other way to recover the account, so choose things only you will always remember.
      </p>
    </form>
  );
}