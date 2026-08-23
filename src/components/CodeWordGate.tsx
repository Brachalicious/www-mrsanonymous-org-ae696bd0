import { useEffect, useState } from "react";

const HASH_KEY = "mrsanon:inbox-codeword";
const UNLOCK_KEY = "mrsanon:inbox-unlocked";

async function hash(value: string) {
  const data = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function CodeWordGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [stored, setStored] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    setStored(localStorage.getItem(HASH_KEY));
    setUnlocked(sessionStorage.getItem(UNLOCK_KEY) === "1");
    setReady(true);
  }, []);

  if (!ready) return <div className="mx-auto max-w-3xl px-5 py-16 text-ink-500">Loading…</div>;
  if (unlocked) return <>{children}</>;

  const isSetup = !stored;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const word = value.trim();
    if (!word) {
      setError("Enter a code word.");
      return;
    }
    if (isSetup) {
      if (word.toLowerCase() !== confirmValue.trim().toLowerCase()) {
        setError("Code words don't match.");
        return;
      }
      const h = await hash(word);
      localStorage.setItem(HASH_KEY, h);
      sessionStorage.setItem(UNLOCK_KEY, "1");
      setStored(h);
      setUnlocked(true);
      return;
    }
    const h = await hash(word);
    if (h !== stored) {
      setError("That code word doesn't match.");
      setValue("");
      return;
    }
    sessionStorage.setItem(UNLOCK_KEY, "1");
    setUnlocked(true);
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="note-card p-6">
        <h1 className="font-serif text-3xl text-ink-900">
          {isSetup ? "Set your inbox code word" : "Enter your code word"}
        </h1>
        <p className="mt-2 text-sm text-ink-700">
          {isSetup
            ? "Pick a private word only you know. You'll need it each time you open your inbox on this device."
            : "Your inbox is protected. Enter the code word you chose."}
        </p>
        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              autoFocus
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Code word"
              className="input-soft w-full pr-14"
              data-testid="inbox-codeword"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide code word" : "Show code word"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-500 hover:text-ink-900"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
          {isSetup && (
            <input
              type={show ? "text" : "password"}
              autoComplete="off"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="Confirm code word"
              className="input-soft"
              data-testid="inbox-codeword-confirm"
            />
          )}
          {error && <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">{error}</div>}
          <button type="submit" className="btn-rose w-full" data-testid="inbox-codeword-submit">
            {isSetup ? "Save & open inbox" : "Unlock inbox"}
          </button>
        </form>
        {!isSetup && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Forgot your code word? You can reset it — your messages stay safe.")) {
                localStorage.removeItem(HASH_KEY);
                setStored(null);
                setValue("");
                setError("");
              }
            }}
            className="mt-4 text-xs text-ink-500 underline"
          >
            Forgot code word?
          </button>
        )}
      </div>
    </div>
  );
}
