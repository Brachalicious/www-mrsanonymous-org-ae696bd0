import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/contexts/AuthContext";
import { PasswordInput } from "@/components/PasswordInput";
import { hasMyQuestions } from "@/lib/security-questions.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — MrsAnonymous" },
      { name: "description", content: "Log in to your anonymous MrsAnonymous account. No email or real name needed." },
      { property: "og:title", content: "Log In — MrsAnonymous" },
      { property: "og:description", content: "Log in to your anonymous MrsAnonymous account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, errMsg } = useAuth();
  const navigate = useNavigate({ from: "/login" });
  const checkQuestions = useServerFn(hasMyQuestions);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ nickname: nickname.trim(), password });
      // Prompt users to set up security questions if they haven't yet.
      try {
        const res = await checkQuestions();
        if (!res.hasQuestions) {
          navigate({ to: "/security-questions", search: { required: "1" } });
          return;
        }
      } catch {
        // If the check fails, don't block the login.
      }
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
        <span className="hand-note text-2xl">welcome back</span>
        <h1 className="mt-2 font-serif text-4xl text-ink-900">Log in</h1>
        <p className="mt-3 text-sm text-ink-500">
          Use your <strong>nickname</strong> and password. We never asked for an email — and we never will.
        </p>

        <form onSubmit={submit} data-testid="login-form" className="note-card mt-8 space-y-4 p-7">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Nickname</span>
            <input
              data-testid="login-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input-soft mt-1.5"
              autoFocus
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Password</span>
            <div className="mt-1.5">
              <PasswordInput
                testid="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="current-password"
                placeholder="Your password"
              />
            </div>
          </label>
          {error && (
            <div data-testid="login-error" className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">
              {error}
            </div>
          )}
          <button data-testid="login-submit" type="submit" disabled={loading} className="btn-rose w-full">
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-500">
          Forgot your password?{" "}
          <Link to="/forgot-password" data-testid="login-link-forgot" className="link-soft underline-offset-4 hover:underline">
            Reset with security questions
          </Link>
        </p>
        <p className="mt-3 text-sm text-ink-500">
          No account yet?{" "}
          <Link to="/signup" data-testid="login-link-signup" className="link-soft underline-offset-4 hover:underline">
            Create an anonymous account
          </Link>
        </p>
      </div>
    </div>
  );
}
