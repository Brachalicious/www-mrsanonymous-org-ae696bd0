import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";

import { useAuth } from "@/contexts/AuthContext";
import { getMyQuestions, verifyMyAnswers } from "@/lib/security-questions.functions";
import { sendContactMessage } from "@/lib/contact.functions";
import { getMyInboxLock, raiseInboxLock } from "@/lib/inbox-lock.functions";

const keyFor = (userId?: string | null) =>
  userId ? `mrsanon:inbox-codeword:${userId}` : "mrsanon:inbox-codeword:anon";
const mathKeyFor = (userId?: string | null) =>
  userId ? `mrsanon:inbox-math:${userId}` : "mrsanon:inbox-math:anon";
const bioKeyFor = (userId?: string | null) =>
  userId ? `mrsanon:inbox-bio:${userId}` : "mrsanon:inbox-bio:anon";

const CALC_PASSCODE_KEY = "calc_disguise_passcode";

async function hash(value: string) {
  const data = new TextEncoder().encode(value.trim().toLowerCase().replace(/\s+/g, ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bytesToB64(b: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(b)));
}

export function CodeWordGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const HASH_KEY = keyFor(user?.id);
  const MATH_KEY = mathKeyFor(user?.id);
  const BIO_KEY = bioKeyFor(user?.id);

  const verifyAnswers = useServerFn(verifyMyAnswers);
  const loadQuestions = useServerFn(getMyQuestions);
  const notifyAdmin = useServerFn(sendContactMessage);
  const fetchLock = useServerFn(getMyInboxLock);
  const lockInbox = useServerFn(raiseInboxLock);

  const [ready, setReady] = useState(false);
  const [stored, setStored] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const [adminLocked, setAdminLocked] = useState(false);
  const [value, setValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [mathValue, setMathValue] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  const [mode, setMode] = useState<"gate" | "recover">("gate");
  const [recoverTab, setRecoverTab] = useState<"math" | "questions">("math");
  const [recoverMath, setRecoverMath] = useState("");
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [busy, setBusy] = useState(false);

  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioMsg, setBioMsg] = useState("");

  useEffect(() => {
    setUnlocked(false);
    setRestricted(false);
    setMode("gate");
    setValue("");
    setConfirmValue("");
    setStored(localStorage.getItem(HASH_KEY));
    setBioEnabled(!!localStorage.getItem(BIO_KEY));
    setReady(false);
    fetchLock({} as never)
      .then((r: { locked: boolean }) => setAdminLocked(!!r.locked))
      .catch(() => setAdminLocked(false))
      .finally(() => setReady(true));
  }, [HASH_KEY, BIO_KEY, fetchLock]);

  useEffect(() => {
    if (mode !== "recover" || questions) return;
    loadQuestions({} as never)
      .then((r: { questions: string[] | null }) => setQuestions(r.questions))
      .catch(() => setQuestions(null));
  }, [mode, questions, loadQuestions]);

  if (!ready) return <div className="mx-auto max-w-3xl px-5 py-16 text-ink-500">Loading…</div>;

  const isSetup = !stored;

  async function alertAdmin(method: string) {
    try {
      await lockInbox({ data: { method } });
      setAdminLocked(true);
    } catch {
      /* keep going */
    }
    try {
      await notifyAdmin({
        data: {
          message:
            `⚠️ Inbox recovery used. A user unlocked their inbox with ${method} after forgetting their code word. ` +
            `Their messages stay hidden until an admin verifies them in the support dashboard. Please review this account.`,
          audience: "women",
          userId: user?.id ?? null,
        },
      });
    } catch {
      /* never block recovery on the alert */
    }
  }

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
      if (mathValue.trim()) localStorage.setItem(MATH_KEY, await hash(mathValue));
      setStored(h);
      setUnlocked(true);
      setRestricted(adminLocked);
      return;
    }
    const h = await hash(word);
    if (h !== stored) {
      setError("That code word doesn't match.");
      setValue("");
      return;
    }
    setUnlocked(true);
    setRestricted(adminLocked);
  }

  async function tryMathRecovery(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const attempt = await hash(recoverMath);
    const savedMath = localStorage.getItem(MATH_KEY);
    const calcPass = localStorage.getItem(CALC_PASSCODE_KEY);
    const calcHash = calcPass ? await hash(calcPass) : null;
    if (!savedMath && !calcHash) {
      setError("No math problem is saved on this device. Try your security questions instead.");
      return;
    }
    if (attempt !== savedMath && attempt !== calcHash) {
      setError("That math problem doesn't match.");
      return;
    }
    setBusy(true);
    await alertAdmin("their calculator math problem");
    setBusy(false);
    setUnlocked(true);
    setRestricted(true);
  }

  async function tryQuestionRecovery(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await verifyAnswers({
        data: { answer_1: answers[0], answer_2: answers[1], answer_3: answers[2] },
      });
      await alertAdmin("their security questions");
      setUnlocked(true);
      setRestricted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not verify your answers.");
    } finally {
      setBusy(false);
    }
  }

  async function enableBiometric() {
    setBioMsg("");
    try {
      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "MrsANONymous" },
          user: {
            id: new TextEncoder().encode(user?.id ?? "anon"),
            name: user?.id ?? "anon",
            displayName: "MrsANONymous inbox",
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;
      if (!cred) throw new Error("No credential");
      localStorage.setItem(BIO_KEY, bytesToB64(cred.rawId));
      setBioEnabled(true);
      setBioMsg("Face / fingerprint unlock is on for this device.");
    } catch {
      setBioMsg("This device can't set up face or fingerprint unlock.");
    }
  }

  async function unlockWithBiometric() {
    setError("");
    try {
      const raw = localStorage.getItem(BIO_KEY);
      if (!raw) return;
      const id = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{ type: "public-key", id }],
          userVerification: "required",
          timeout: 60000,
        },
      });
      if (!assertion) throw new Error("cancelled");
      setUnlocked(true);
      setRestricted(adminLocked);
    } catch {
      setError("Face / fingerprint unlock didn't work. Use your code word.");
    }
  }

  function resetCodeWord() {
    localStorage.removeItem(HASH_KEY);
    setStored(null);
    setUnlocked(false);
    setMode("gate");
    setValue("");
    setConfirmValue("");
    setError("");
  }

  if (unlocked && restricted) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16">
        <div className="note-card space-y-4 p-6">
          <h1 className="font-serif text-3xl text-ink-900">Inbox unlocked in safe mode</h1>
          <p className="text-sm text-ink-700">
            Your messages stay hidden until our support team verifies that this account is really yours. Setting a new
            code word will not reveal them. Support has been notified and will unlock your inbox once you're verified.
          </p>
          <div className="relative overflow-hidden rounded-xl border border-ink-300/40 bg-cream-100 p-5">
            <div className="select-none space-y-3 blur-sm" aria-hidden>
              <div className="h-4 w-3/4 rounded bg-ink-300/50" />
              <div className="h-4 w-2/3 rounded bg-ink-300/40" />
              <div className="h-4 w-5/6 rounded bg-ink-300/50" />
              <div className="h-4 w-1/2 rounded bg-ink-300/40" />
            </div>
            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-widest text-ink-500">
              Messages hidden
            </p>
          </div>
          <p className="text-xs text-ink-500">
            You can still send a new message to support from here — just reply to the support thread once verified.
          </p>
          <button type="button" className="btn-ghost w-full" onClick={resetCodeWord}>
            Set a new code word (messages stay hidden until verified)
          </button>
        </div>
      </div>
    );
  }

  if (unlocked) {
    return (
      <>
        {!bioEnabled && (
          <div className="mx-auto mt-4 max-w-3xl px-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-300/40 bg-cream-100 px-4 py-3 text-sm text-ink-700">
              <span>Unlock faster next time with face or fingerprint.</span>
              <button type="button" className="btn-rose px-4 py-1.5 text-xs" onClick={enableBiometric}>
                Enable
              </button>
            </div>
            {bioMsg && <p className="mt-2 text-xs text-ink-500">{bioMsg}</p>}
          </div>
        )}
        {children}
      </>
    );
  }

  if (mode === "recover") {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <div className="note-card p-6">
          <h1 className="font-serif text-3xl text-ink-900">Get back into your inbox</h1>
          <p className="mt-2 text-sm text-ink-700">
            Answer one of these to get in. Your old messages stay hidden until you set a new code word, and support is
            notified.
          </p>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRecoverTab("math");
                setError("");
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${recoverTab === "math" ? "bg-emergency text-white" : "bg-cream-100 text-ink-700"}`}
            >
              Math problem
            </button>
            <button
              type="button"
              onClick={() => {
                setRecoverTab("questions");
                setError("");
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${recoverTab === "questions" ? "bg-emergency text-white" : "bg-cream-100 text-ink-700"}`}
            >
              Security questions
            </button>
          </div>

          {recoverTab === "math" ? (
            <form className="mt-5 space-y-3" onSubmit={tryMathRecovery}>
              <p className="text-xs text-ink-500">
                Enter your favourite math problem — the same one that unlocks the calculator cover.
              </p>
              <input
                type="password"
                autoFocus
                autoComplete="off"
                value={recoverMath}
                onChange={(e) => setRecoverMath(e.target.value)}
                placeholder="e.g. 7*8"
                className="input-soft w-full"
                data-testid="inbox-recover-math"
              />
              {error && <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">{error}</div>}
              <button type="submit" disabled={busy} className="btn-rose w-full">
                {busy ? "Checking…" : "Unlock"}
              </button>
            </form>
          ) : (
            <form className="mt-5 space-y-3" onSubmit={tryQuestionRecovery}>
              {questions === null ? (
                <p className="text-sm text-ink-500">
                  No security questions are set up on this account yet.
                </p>
              ) : (
                questions.map((q, i) => (
                  <div key={q + i} className="space-y-1">
                    <span className="text-xs font-semibold text-ink-700">{q}</span>
                    <input
                      type="password"
                      autoComplete="off"
                      value={answers[i]}
                      onChange={(e) =>
                        setAnswers((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))
                      }
                      placeholder="Your answer"
                      className="input-soft w-full"
                    />
                  </div>
                ))
              )}
              {error && <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">{error}</div>}
              {questions !== null && (
                <button type="submit" disabled={busy} className="btn-rose w-full">
                  {busy ? "Checking…" : "Unlock"}
                </button>
              )}
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              setMode("gate");
              setError("");
            }}
            className="mt-4 text-xs text-ink-500 underline"
          >
            Back to code word
          </button>
        </div>
      </div>
    );
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
            <>
              <input
                type={show ? "text" : "password"}
                autoComplete="off"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
                placeholder="Confirm code word"
                className="input-soft"
                data-testid="inbox-codeword-confirm"
              />
              <input
                type={show ? "text" : "password"}
                autoComplete="off"
                value={mathValue}
                onChange={(e) => setMathValue(e.target.value)}
                placeholder="Backup: your favourite math problem (e.g. 7*8)"
                className="input-soft"
                data-testid="inbox-codeword-math"
              />
              <p className="text-[11px] text-ink-500">
                Use the same math problem that unlocks your calculator cover — it's how you get back in if you forget
                your code word.
              </p>
            </>
          )}
          {error && <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">{error}</div>}
          <button type="submit" className="btn-rose w-full" data-testid="inbox-codeword-submit">
            {isSetup ? "Save & open inbox" : "Unlock inbox"}
          </button>
        </form>

        {!isSetup && (
          <div className="mt-4 space-y-2">
            {bioEnabled && (
              <button type="button" onClick={unlockWithBiometric} className="w-full text-xs font-semibold text-ink-700 underline">
                Unlock with face or fingerprint
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setMode("recover");
                setError("");
              }}
              className="text-xs text-ink-500 underline"
              data-testid="inbox-forgot"
            >
              Forgot code word?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
