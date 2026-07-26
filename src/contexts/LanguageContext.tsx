import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANGUAGES, translate, type LangCode } from "@/lib/translations";

const STORAGE_KEY = "mrsanon:lang";

type LanguageContextValue = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitial(): LangCode {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as LangCode | null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
  } catch {}
  const nav = (typeof navigator !== "undefined" ? navigator.language : "en").slice(0, 2).toLowerCase();
  const match = LANGUAGES.find((l) => l.code === nav);
  return (match?.code ?? "en") as LangCode;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  // Hydrate on client to avoid SSR mismatch.
  useEffect(() => {
    setLangState(detectInitial());
  }, []);

  const dir: "ltr" | "rtl" = useMemo(() => {
    return LANGUAGES.find((l) => l.code === lang)?.dir === "rtl" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  }, []);

  const t = useCallback((key: string) => translate(lang, key), [lang]);

  const value = useMemo(() => ({ lang, setLang, t, dir }), [lang, setLang, t, dir]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback if used outside provider (e.g. during SSR error boundary).
    return {
      lang: "en",
      setLang: () => {},
      t: (k) => translate("en", k),
      dir: "ltr",
    };
  }
  return ctx;
}