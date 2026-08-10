import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PasswordInput } from "@/components/PasswordInput";
import { COUNTRY_OPTIONS, detectCountry } from "@/lib/emergency-numbers";
import { useEffect } from "react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — MrsAnonymous" },
      { name: "description", content: "Create an anonymous MrsAnonymous account. No email or real name needed." },
      { property: "og:title", content: "Create Account — MrsAnonymous" },
      { property: "og:description", content: "Create an anonymous MrsAnonymous account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { register, errMsg } = useAuth();
  const navigate = useNavigate({ from: "/signup" });
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [audience, setAudience] = useState<"women" | "girls">("women");
  const [country, setCountry] = useState("US");
  const [stateRegion, setStateRegion] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCountry(detectCountry());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await register({
        nickname: nickname.trim(),
        password,
        audience,
        country,
        state_region: stateRegion.trim() || undefined,
        city: city.trim() || undefined,
      });
      try {
        localStorage.setItem("mrsanon:country", country);
      } catch {
        /* ignore */
      }
      navigate({ to: "/security-questions", search: { required: "1" } });
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="paper-bg">
      <div className="mx-auto max-w-md px-5 py-20 lg:px-10">
        <span className="hand-note text-2xl">a private space, just for you</span>
        <h1 className="mt-2 font-serif text-4xl text-ink-900">Create an anonymous account</h1>
        <p className="mt-3 text-sm text-ink-500">
          No email. No real name. Just a nickname only you remember and a password.
        </p>

        <form onSubmit={submit} data-testid="signup-form" className="note-card mt-8 space-y-4 p-7">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
              Nickname (do NOT use your real name)
            </span>
            <input
              data-testid="signup-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input-soft mt-1.5"
              placeholder="e.g. quiet-rose"
              minLength={2}
              maxLength={40}
              required
              autoFocus
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Password</span>
            <div className="mt-1.5">
              <PasswordInput
                testid="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="new-password"
                placeholder="Your password"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">Confirm password</span>
            <div className="mt-1.5">
              <PasswordInput
                testid="signup-confirm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                name="new-password-confirm"
                placeholder="Type the password again"
              />
            </div>
          </label>
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">I identify as</span>
            <div className="mt-2 flex gap-3">
              <label
                data-testid="signup-audience-women"
                className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm transition ${
                  audience === "women"
                    ? "border-rose-400 bg-rose-400/10 font-semibold text-rose-600"
                    : "border-ink-300/40 text-ink-700"
                }`}
              >
                <input
                  type="radio"
                  name="aud"
                  value="women"
                  checked={audience === "women"}
                  onChange={() => setAudience("women")}
                  className="sr-only"
                />
                A woman
              </label>
              <label
                data-testid="signup-audience-girls"
                className={`flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm transition ${
                  audience === "girls"
                    ? "border-rose-400 bg-rose-400/10 font-semibold text-rose-600"
                    : "border-ink-300/40 text-ink-700"
                }`}
              >
                <input
                  type="radio"
                  name="aud"
                  value="girls"
                  checked={audience === "girls"}
                  onChange={() => setAudience("girls")}
                  className="sr-only"
                />
                A girl / teen
              </label>
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
              Where are you? (for local emergency numbers &amp; help)
            </span>
            <select
              data-testid="signup-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-soft mt-1.5"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-ink-500">
              Only your country — never your address. It lets us show the right emergency number and local
              resources.
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
                State / Region <span className="normal-case tracking-normal">(optional)</span>
              </span>
              <input
                data-testid="signup-state"
                value={stateRegion}
                onChange={(e) => setStateRegion(e.target.value)}
                className="input-soft mt-1.5"
                placeholder="e.g. Texas"
                maxLength={80}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-widest text-ink-500">
                City <span className="normal-case tracking-normal">(optional)</span>
              </span>
              <input
                data-testid="signup-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-soft mt-1.5"
                placeholder="e.g. Austin"
                maxLength={80}
              />
            </label>
          </div>
          <p className="text-[11px] text-ink-500">
            State and city are optional — they only help us show shelters and hotlines closer to you. Never
            enter your street address.
          </p>

          {error && (
            <div data-testid="signup-error" className="rounded-md bg-emergency/10 px-3 py-2 text-sm text-emergency">
              {error}
            </div>
          )}

          <button data-testid="signup-submit" type="submit" disabled={loading} className="btn-rose w-full">
            {loading ? "Creating…" : "Create my anonymous account"}
          </button>

          <p className="text-[11px] leading-relaxed text-ink-500">
            We store only your nickname and a one-way hash of your password. On the next screen you'll set 3
            security questions — the only way to recover your account if you forget your password.
          </p>
        </form>

        <p className="mt-6 text-sm text-ink-500">
          Already have one?{" "}
          <Link to="/login" data-testid="signup-link-login" className="link-soft underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
