import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { performQuickExit } from "./QuickExit";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES, type LangCode } from "@/lib/translations";
import { getEmergency } from "@/lib/emergency-numbers";
import { useRegion } from "@/hooks/use-region";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getUnreadMessageCount } from "@/lib/contact.functions";
import { HIDE_HISTORY_CHANGE_EVENT, isHideHistoryEnabled, reopenPrivacyBanner, setHideHistoryEnabled } from "./PrivacyBanner";


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
  { to: "/tools", label: "Tools", testid: "nav-tools" },
  { to: "/resources", label: "Resources", testid: "nav-resources" },
  { to: "/download", label: "📱 Download App", testid: "nav-download" },
  { to: "https://www.thehotline.org/", label: "Get help now! (women)", testid: "nav-get-help-women", kind: "dark", external: true },
  { to: "https://childhelphotline.org/", label: "get help now! (girls)", testid: "nav-get-help-girls", kind: "dark", external: true },
];


const INBOX_TAB: NavItem = {
  to: "/inbox",
  label: "📬 Inbox",
  testid: "nav-inbox-tab",
};

const TAB_LABEL_KEYS: Record<string, string> = {
  "nav-about": "nav.about",
  "nav-women": "nav.women",
  "nav-girls": "nav.girls",
  "nav-tell-story": "nav.tellStory",
  "nav-board": "nav.board",
  "nav-tools": "nav.tools",
  "nav-resources": "nav.resources",
  "nav-get-help-women": "nav.getHelpWomen",
  "nav-get-help-girls": "nav.getHelpGirls",
};

function getTabs(loggedIn: boolean): NavItem[] {
  return [
    BASE_TABS[0],
    BASE_TABS[1],
    BASE_TABS[2],
    BASE_TABS[3],
    BASE_TABS[4],
    BASE_TABS[5],
    BASE_TABS[6],
    BASE_TABS[7],
    BASE_TABS[8],
    BASE_TABS[9],
  ];
}

export function Navbar() {
  const { user, profile, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [hideHistory, setHideHistory] = useState(false);
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const { country: region } = useRegion();
  const emergency = getEmergency(lang, region);
  const fetchUnread = useServerFn(getUnreadMessageCount);
  const isClient = typeof window !== "undefined";

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-count", user?.id],
    queryFn: () => fetchUnread(),
    enabled: isClient && !!user,
    refetchInterval: 30_000,
    retry: false,
  });

  useEffect(() => {
    setHideHistory(isHideHistoryEnabled());
    function onStorage(e: StorageEvent) {
      if (e.key === "mrsanon:hide-history") {
        setHideHistory(e.newValue === "1");
      }
    }
    function onHideHistoryChange(e: Event) {
      setHideHistory((e as CustomEvent<boolean>).detail);
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(HIDE_HISTORY_CHANGE_EVENT, onHideHistoryChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(HIDE_HISTORY_CHANGE_EVENT, onHideHistoryChange);
    };
  }, []);

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
            <span className="text-white/80">{t("safety.needLeave")}</span>
            <span className="text-white">
              {t("safety.pressEsc")} <kbd className="rounded border border-white/40 bg-black px-1.5 py-0.5 text-[10px] font-bold">ESC</kbd>
              <span className="px-1 text-white/40">{t("safety.or")}</span>
              {t("safety.clickQuickExit")} <span className="font-bold text-rose-400">✕ {t("safety.quickExit").toUpperCase()}</span>
              <span className="px-1 text-white/40">{t("safety.switchGoogle")}</span>
            </span>
          </div>
          <label className="inline-flex items-center gap-1 rounded-sm border border-white/30 bg-white/5 px-2 py-1 text-[10px] font-semibold normal-case tracking-normal text-white">
            <span aria-hidden>🌐</span>
            <span className="sr-only">{t("safety.language")}</span>
            <select
              data-testid="safety-strip-language"
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              className="bg-transparent text-white outline-none [&>option]:bg-ink-900 [&>option]:text-white"
              aria-label={t("safety.language")}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}
                </option>
              ))}
            </select>
          </label>
          <button
            data-testid="safety-strip-quick-exit"
            onClick={performQuickExit}
            className="rounded-sm border border-rose-400 bg-rose-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white hover:bg-rose-600"
          >
            ✕ {t("safety.quickExit")}
          </button>
          <a
            data-testid="safety-strip-call-911"
            href={`tel:${emergency.police}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-red-600 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white shadow hover:bg-red-700"
            title={`Immediate danger? Tap to call ${emergency.policeLabel}.`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black">
              <Shield className="h-4 w-4 fill-black" />
            </span>
            <span className="leading-none">POLICE</span>
          </a>
        </div>
      </div>

      {/* Brand + auth */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 pt-4 lg:px-10">
        <Link to="/" data-testid="nav-logo" className="group flex flex-col leading-none">
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-2xl tracking-tight text-ink-900">Mrs</span>
            <span className="font-serif text-2xl italic text-rose-500">ANONymous</span>
            <span className="hidden font-serif text-xl text-ink-300 sm:inline">.org</span>
          </div>
        </Link>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            data-testid="hide-history-indicator"
            onClick={() => {
              setHideHistoryEnabled(!hideHistory);
              reopenPrivacyBanner();
            }}
            className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              hideHistory
                ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-600"
                : "border-ink-900/30 bg-ink-900/5 text-ink-700 hover:bg-ink-900/10"
            }`}
            title="Hide this site from your browser's back button"
          >
            <ShieldIcon className="h-3 w-3" />
            {hideHistory ? "History hidden" : "Hide history"}
          </button>
          {loggedIn ? (
            <>
              <span className="text-xs text-ink-500">
                Hello, <span className="font-semibold text-ink-900">{profile?.nickname || "friend"}</span>
              </span>
              <Link
                to={isAdmin ? "/admin/messages" : "/inbox"}
                data-testid="nav-inbox"
                className="relative inline-flex items-center gap-1.5 rounded-full border border-ink-900/30 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-ink-900 hover:text-white"
                aria-label={t("nav.inbox")}
                title={t("nav.inbox")}
              >
                <MailIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.inbox")}</span>
                {!!unreadCount && unreadCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
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
                data-testid="nav-inbox"
                className="relative inline-flex items-center gap-1.5 rounded-full border border-ink-900/30 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-ink-900 hover:text-white"
                aria-label={t("nav.inbox")}
                title={t("nav.inbox")}
              >
                <MailIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.inbox")}</span>
              </Link>
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

        <div className="flex items-center gap-2 lg:hidden">
          {!loggedIn && (
            <Link
              to="/login"
              data-testid="nav-login-mobile"
              className="rounded-full bg-ink-900 px-4 py-2 text-xs font-extrabold uppercase tracking-widest text-white shadow"
            >
              Log in
            </Link>
          )}
          <button
            data-testid="hide-history-indicator-mobile"
            onClick={() => {
              setHideHistoryEnabled(!hideHistory);
              reopenPrivacyBanner();
            }}
            className={`inline-flex items-center gap-1 rounded-sm border px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
              hideHistory
                ? "border-emerald-300/60 bg-emerald-500/20 text-emerald-600"
                : "border-ink-900/30 bg-ink-900/5 text-ink-700"
            }`}
            title="Hide this site from your browser's back button"
            aria-label={hideHistory ? "History hidden" : "Hide history"}
          >
            <ShieldIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{hideHistory ? "Hidden" : "Hide"}</span>
          </button>
          <button
            data-testid="nav-mobile-toggle"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-ink-300/40 p-2"
            aria-label="Toggle menu"
          >
          <div className="space-y-1">
            <div className="h-0.5 w-5 bg-ink-900" />
            <div className="h-0.5 w-5 bg-ink-900" />
            <div className="h-0.5 w-5 bg-ink-900" />
          </div>
          </button>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden lg:block">
        <ul className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-3 lg:px-10">
          {tabs.map((tab) => {
            const className = tabClassName(tab.kind);
            const labelKey = TAB_LABEL_KEYS[tab.testid];
            const label = labelKey ? t(labelKey) : tab.label;
            if (tab.external) {
              return (
                <li key={tab.testid}>
                  <a
                    href={tab.to}

                    rel="noopener noreferrer"
                    data-testid={tab.testid}
                    className={className}
                  >
                    {label}
                  </a>
                </li>
              );
            }

            return (
              <li key={tab.testid}>
                <Link
                  to={tab.to as any}
                  data-testid={tab.testid}
                  className={className}
                  activeProps={{ className: `${className} text-rose-500 font-semibold` }}
                  activeOptions={{ exact: false }}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-ink-300/30 bg-white lg:hidden">
          <div className="flex flex-col gap-2 px-5 py-4">
            {tabs.map((tab) => {
              const labelKey = TAB_LABEL_KEYS[tab.testid];
              const label = labelKey ? t(labelKey) : tab.label;
              if (tab.external) {
                return (
                  <a
                    key={tab.testid}
                    href={tab.to}

                    rel="noopener noreferrer"
                    data-testid={`${tab.testid}-mobile`}
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-ink-900 px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-white"
                  >
                    {label}
                  </a>
                );
              }

              return (
                <Link
                  key={tab.testid}
                  to={tab.to as any}
                  data-testid={`${tab.testid}-mobile`}
                  onClick={() => setOpen(false)}
                  className={
                    tab.kind === "dark"
                      ? "rounded-md bg-ink-900 px-3 py-2 text-center text-xs font-bold uppercase tracking-widest text-white"
                      : "rounded-lg px-3 py-2 text-sm text-ink-900 hover:bg-ink-100"
                  }
                >
                  {label}
                </Link>
              );
            })}
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
              <></>
            )}
            {loggedIn && (
              <>
                <Link
                  to={isAdmin ? "/admin/messages" : "/inbox"}
                  onClick={() => setOpen(false)}
                  className="relative flex items-center justify-center gap-2 rounded-lg border border-ink-900/30 px-3 py-2 text-center text-sm font-semibold text-ink-900"
                >
                  <MailIcon className="h-4 w-4" />
                  {t("nav.inbox")}
                  {!!unreadCount && unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            {!loggedIn && (
              <>
                <Link
                  to="/inbox"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-ink-900/30 px-3 py-2 text-center text-sm font-semibold text-ink-900"
                >
                  <MailIcon className="h-4 w-4" />
                  {t("nav.inbox")}
                </Link>
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

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
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
