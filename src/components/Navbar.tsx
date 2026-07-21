import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { performQuickExit } from "./QuickExit";

type NavItem = {
  to: string;
  label: string;
  testid: string;
  kind?: "dark" | "rose";
  external?: boolean;
};

const BASE_TABS: NavItem[] = [
  { to: "/about", label: "About us", testid: "nav-about" },
  { to: "/women", label: "Women", testid: "nav-women" },
  { to: "/girls", label: "Girls", testid: "nav-girls" },
  { to: "/tell-your-story", label: "Tell Your Story!", testid: "nav-tell-story" },
  { to: "/board", label: "The Board", testid: "nav-board" },
  { to: "/tools", label: "Tools", testid: "nav-tools" },
  { to: "/resources", label: "Resources", testid: "nav-resources" },
  { to: "https://www.thehotline.org/", label: "Get help now! (women)", testid: "nav-get-help-women", kind: "dark", external: true },
  { to: "https://childhelphotline.org/", label: "get help now! (girls)", testid: "nav-get-help-girls", kind: "dark", external: true },
];

const MY_NOTEBOOKS_TAB: NavItem = {
  to: "/tell-your-story",
  label: "📓 My Notebooks",
  testid: "nav-my-notebooks",
  kind: "rose",
};

function getTabs(loggedIn: boolean): NavItem[] {
  if (!loggedIn) return BASE_TABS;
  return [
    BASE_TABS[0],
    BASE_TABS[1],
    BASE_TABS[2],
    BASE_TABS[3],
    MY_NOTEBOOKS_TAB,
    BASE_TABS[4],
    BASE_TABS[5],
    BASE_TABS[6],
    BASE_TABS[7],
    BASE_TABS[8],
  ];
}

export function Navbar() {
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const loggedIn = !!user;
  const tabs = getTabs(loggedIn);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink-300 bg-white/95 backdrop-blur-xl">
      {/* Safety strip */}
      <div className="bg-ink-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-5 py-2 text-[11px] uppercase tracking-widest lg:px-10">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 animate-soft-pulse rounded-full bg-rose-500" />
            <span className="text-white/80">Need to leave fast?</span>
            <span className="text-white">
              Press <kbd className="rounded border border-white/40 bg-black px-1.5 py-0.5 text-[10px] font-bold">ESC</kbd>
              <span className="px-1 text-white/40">or</span>
              click <span className="font-bold text-rose-400">✕ QUICK EXIT</span>
              <span className="px-1 text-white/40">to switch this tab to Google.</span>
            </span>
          </div>
          <button
            data-testid="safety-strip-quick-exit"
            onClick={performQuickExit}
            className="rounded-sm border border-rose-400 bg-rose-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white hover:bg-rose-600"
          >
            ✕ Quick Exit
          </button>
        </div>
      </div>

      {/* Brand + auth */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 pt-4 lg:px-10">
        <Link to="/" data-testid="nav-logo" className="group flex items-baseline gap-1">
          <span className="font-serif text-2xl tracking-tight text-ink-900">Mrs</span>
          <span className="font-serif text-2xl italic text-rose-500">ANONymous</span>
          <span className="hidden font-serif text-xl text-ink-300 sm:inline">.org</span>
        </Link>

        <div className="hidden items-center gap-3 lg:flex">
          {loggedIn ? (
            <>
              <span className="text-xs text-ink-500">
                Hello, <span className="font-semibold text-ink-900">{profile?.nickname || "friend"}</span>
              </span>
              <Link
                to="/tell-your-story"
                search={{ tab: "mine" }}
                data-testid="nav-my-notebooks-top"
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white shadow hover:bg-rose-600"
              >
                📓 My Notebooks
              </Link>
              <button
                data-testid="nav-logout"
                onClick={handleLogout}
                className="rounded-full border border-ink-900/30 px-4 py-1.5 text-xs font-semibold text-ink-900 hover:bg-ink-900 hover:text-white"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                data-testid="nav-login"
                className="rounded-full border border-ink-900/30 px-4 py-1.5 text-xs font-semibold text-ink-900 hover:bg-ink-900 hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                data-testid="nav-signup"
                className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-extrabold uppercase tracking-widest text-white hover:bg-rose-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          data-testid="nav-mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-ink-300/40 p-2 lg:hidden"
          aria-label="Toggle menu"
        >
          <div className="space-y-1">
            <div className="h-0.5 w-5 bg-ink-900" />
            <div className="h-0.5 w-5 bg-ink-900" />
            <div className="h-0.5 w-5 bg-ink-900" />
          </div>
        </button>
      </div>

      {/* Desktop nav */}
      <nav className="hidden lg:block">
        <ul className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 lg:px-10">
          {tabs.map((t) => {
            const className = tabClassName(t.kind);
            if (t.external) {
              return (
                <li key={t.to}>
                  <a
                    href={t.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={t.testid}
                    className={className}
                  >
                    {t.label}
                  </a>
                </li>
              );
            }

              if (t.to === "/tell-your-story" && t.kind === "rose") {
                return (
                  <li key={t.to}>
                    <Link
                      to="/tell-your-story"
                      search={{ tab: "mine" }}
                      data-testid={t.testid}
                      className={className}
                      activeProps={{ className: `${className} text-rose-500 font-semibold` }}
                      activeOptions={{ exact: false }}
                    >
                      {t.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={t.to}>
                  <Link
                    to={t.to as any}
                    data-testid={t.testid}
                    className={className}
                    activeProps={{ className: `${className} text-rose-500 font-semibold` }}
                    activeOptions={{ exact: false }}
                  >
                    {t.label}
                  </Link>
                </li>
              );
          })}
          <li className="ml-auto">
            <button
              data-testid="nav-quick-exit"
              onClick={performQuickExit}
              title="Switches this tab to Google. Press ESC anytime."
              className="inline-flex items-center gap-1.5 rounded-md bg-emergency px-4 py-2 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-md ring-2 ring-emergency/30 hover:bg-emergency-dark"
            >
              <span aria-hidden>✕</span>
              qUICK eXIT!
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-ink-300/30 bg-white lg:hidden">
          <div className="flex flex-col gap-2 px-5 py-4">
            {tabs.map((t) => {
              if (t.external) {
                return (
                  <a
                    key={t.to}
                    href={t.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`${t.testid}-mobile`}
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-ink-900 px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-white"
                  >
                    {t.label}
                  </a>
                );
              }

              if (t.to === "/tell-your-story" && t.kind === "rose") {
                return (
                  <Link
                    key={t.to}
                    to="/tell-your-story"
                    search={{ tab: "mine" }}
                    data-testid={`${t.testid}-mobile`}
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-rose-500 px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-white"
                  >
                    {t.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={t.to}
                  to={t.to as any}
                  data-testid={`${t.testid}-mobile`}
                  onClick={() => setOpen(false)}
                  className={
                    t.kind === "dark"
                      ? "rounded-md bg-ink-900 px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-white"
                      : "rounded-lg px-3 py-2 text-sm text-ink-900 hover:bg-ink-100"
                  }
                >
                  {t.label}
                </Link>
              );
            })}
            <button
              data-testid="nav-quick-exit-mobile"
              onClick={performQuickExit}
              className="rounded-md bg-emergency px-3 py-2 text-center text-xs font-extrabold uppercase tracking-widest text-white"
            >
              ✕ qUICK eXIT!
            </button>
            {loggedIn ? (
              <button
                data-testid="nav-logout-mobile"
                onClick={async () => {
                  await handleLogout();
                  setOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-left text-sm text-ink-900 hover:bg-ink-100"
              >
                Log out ({profile?.nickname || "friend"})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-ink-900/30 px-3 py-2 text-center text-sm font-semibold text-ink-900"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-rose-500 px-3 py-2 text-center text-sm font-extrabold uppercase tracking-widest text-white"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function tabClassName(kind?: "dark" | "rose") {
  if (kind === "rose") {
    return "inline-flex items-center rounded-md bg-rose-500 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-rose-600";
  }
  if (kind === "dark") {
    return "inline-flex items-center rounded-md bg-ink-900 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-ink-700";
  }
  return "text-sm tracking-wide text-ink-900 transition-colors hover:text-rose-500";
}
