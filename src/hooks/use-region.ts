import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { detectCountry } from "@/lib/emergency-numbers";

const KEY = "mrsanon:country";

/**
 * The visitor's country, used to route emergency numbers and local resources.
 * Prefers the country saved on the signed-in profile, then a locally stored
 * choice, then a best-effort guess from the browser locale.
 */
export function useRegion() {
  const { profile } = useAuth();
  const [stored, setStored] = useState<string | null>(null);

  useEffect(() => {
    try {
      setStored(localStorage.getItem(KEY));
    } catch {
      /* ignore */
    }
  }, []);

  const profileCountry = (profile as { country?: string | null } | null)?.country ?? null;

  useEffect(() => {
    if (profileCountry) {
      try {
        localStorage.setItem(KEY, profileCountry);
      } catch {
        /* ignore */
      }
    }
  }, [profileCountry]);

  const setCountry = useCallback((code: string) => {
    setStored(code);
    try {
      localStorage.setItem(KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const country = profileCountry ?? stored ?? (typeof window === "undefined" ? null : detectCountry());

  return { country, setCountry };
}
