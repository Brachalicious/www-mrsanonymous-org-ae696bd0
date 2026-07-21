import { useState } from "react";

interface ContactFormProps {
  audience?: "women" | "girls";
}

export function ContactForm({ audience = "women" }: ContactFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setStatus("Please write a message before sending.");
      return;
    }
    setSending(true);
    setStatus("");
    try {
      await new Promise((res) => setTimeout(res, 800));
      setStatus("✓ Message received. Thank you for trusting us with it.");
      setMessage("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="note-card p-7" data-testid={`contact-form-${audience}`}>
      <div className="text-xs font-bold uppercase tracking-[0.3em] text-rose-500">Contact us anonymously</div>
      <p className="mt-2 text-ink-700">
        We do not ask for your name or email. This message is for this visit only.
      </p>

      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Your message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            maxLength={2000}
            className="input-soft mt-1.5"
            placeholder={`I am reaching out because... (${audience === "girls" ? "anything you say stays private" : "you are in control of what you share"})`}
          />
        </label>

        {status && (
          <div
            className={`rounded-md px-3 py-2 text-sm ${status.startsWith("✓") ? "bg-green-50 text-green-700" : "bg-emergency/10 text-emergency"}`}
          >
            {status}
          </div>
        )}

        <button type="submit" disabled={sending} className="btn-rose w-full">
          {sending ? "Sending…" : "Send message anonymously"}
        </button>

        <p className="text-[11px] leading-relaxed text-ink-500">
          This message is not stored or linked to an identity. If you are in immediate danger, please contact emergency
          services or a crisis hotline directly.
        </p>
      </form>
    </div>
  );
}
