import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/contexts/AuthContext";
import { PasswordInput } from "@/components/PasswordInput";
import { getQuestionsForNickname, resetPasswordWithAnswers } from "@/lib/security-questions.functions";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — MrsAnonymous" },
      { name: "description", content: "Recover your anonymous MrsAnonymous account using your security questions. No email needed." },
      { property: "og:title", content: "Reset Password — MrsAnonymous" },
      { property: "og:description", content: "Recover your MrsAnonymous account with your security questions." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { login, errMsg } = useAuth();
  const navigate = useNavigate({ from: "/forgot-password" });
  const fetchQuestions = useServerFn(getQuestionsForNickname);
  const resetPassword = useServerFn(resetPasswordWithAnswers);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [nickname, setNickname] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [a1, setA1] = useState("");
  const [a2, setA2] = useState("");
  const [a3, setA3] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookupQuestions(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetchQuestions({ data: { nickname: nickname.trim() } });
      setQuestions(res.questions);
      setStep(2);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  function goToPassword(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!a1.trim() || !a2.trim() || !a3.trim()) {
      setError("Please answer all three questions.");
      return;
    }
    setStep(3);
  }

  async function doReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPw !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await resetPassword({
        data: {
          nickname: nickname.trim(),
          answer_1: a1,
          answer_2: a2,
          answer_3: a3,
          new_password: newPw,
        },
      });
      await login({ nickname: nickname.trim(), password: newPw });
      navigate({ to: "/tell-your-story", search: { tab: "mine" } });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="paper-bg">
      <div className="mx-auto max-w-md px-5 py-20 lg:px-10">
        <span className="hand-note text-2xl">it's okay — we'll get you back in</span>
        <h1 className="mt-2 font-serif text-4xl text-ink-900">Reset your password</h1>
        <p className="mt-3 text-sm text-ink-500">
          There's no email on file — that's the whole point. Answer the security questions you set up and choose a new password.
        </p>

        <div className="mt-6 flex gap-2 text-xs uppercase tracking-widest text-ink-500">
          <span className={step >= 1 ? "text-rose-500 font-semibold" : ""}>1. Nickname</span>
          <span>·</span>
          <span className={step >= 2 ? "text-rose-500 font-semibold" : ""}>2. Questions</span>
          <span>·</span>
          <span className={step >= 3 ? "text-rose-500 font-semibold" : ""}>3. New password</span>
        </div>

        {step === 1 && (
          <form onSubmit={lookupQuestions} data-testid="forgot-step-1" className="note-card mt-6 space-y-4 p-7">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Your nickname</span>
              <input
                data-testid="forgot-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input-soft mt-1.5"
                autoFocus
                required
              />
            </label>
            {error && (
              <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency" data-testid="forgot-error">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-rose w-full">
              {loading ? "Looking up…" : "Continue"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={goToPassword} data-testid="forgot-step-2" className="note-card mt-6 space-y-5 p-7">
            {questions.map((q, idx) => {
              const val = [a1, a2, a3][idx];
              const setter = [setA1, setA2, setA3][idx];
              const display = q.startsWith("__custom__") ? q.replace(/^__custom__/, "") : q;
              return (
                <label key={idx} className="block">
                  <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
                    Question {idx + 1}
                  </span>
                  <p className="mt-1 text-sm text-ink-900">{display}</p>
                  <div className="mt-2">
                    <PasswordInput
                      testid={`forgot-answer-${idx + 1}`}
                      value={val}
                      onChange={(e) => setter(e.target.value)}
                      name={`recovery-answer-${idx + 1}`}
                      placeholder="Your answer"
                    />
                  </div>
                </label>
              );
            })}
            {error && (
              <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency" data-testid="forgot-error">
                {error}
              </div>
            )}
            <button type="submit" className="btn-rose w-full">
              Continue
            </button>
            <button type="button" onClick={() => setStep(1)} className="btn-ghost w-full">
              Back
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={doReset} data-testid="forgot-step-3" className="note-card mt-6 space-y-4 p-7">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">New password</span>
              <div className="mt-1.5">
                <PasswordInput
                  testid="forgot-new-password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  name="new-password"
                  placeholder="Your new password"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Confirm new password</span>
              <div className="mt-1.5">
                <PasswordInput
                  testid="forgot-confirm-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  name="new-password-confirm"
                  placeholder="Type the password again"
                />
              </div>
            </label>
            {error && (
              <div className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency" data-testid="forgot-error">
                {error}
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-rose w-full">
              {loading ? "Resetting…" : "Reset password and log in"}
            </button>
            <button type="button" onClick={() => setStep(2)} className="btn-ghost w-full">
              Back
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-ink-500">
          Remembered it?{" "}
          <Link to="/login" className="link-soft underline-offset-4 hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}