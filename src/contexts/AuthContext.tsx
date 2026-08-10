import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { registerAnonymousUser } from "@/lib/auth.functions";

export interface Profile {
  id: string;
  nickname: string | null;
  audience: string | null;
  country: string | null;
  created_at: string;
  updated_at: string | null;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (creds: { nickname: string; password: string }) => Promise<void>;
  register: (creds: {
    nickname: string;
    password: string;
    audience: "women" | "girls";
    country?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  errMsg: (e: unknown) => string;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  errMsg: () => "Something went wrong.",
});

const sb = supabase as any;

function nicknameToEmail(nickname: string) {
  return `${nickname.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}@mrsanonymous.local`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(user ?? null);

      if (user) {
        const { data } = await sb.from("profiles").select("*").eq("id", user.id).single();
        if (mounted) setProfile((data as Profile | null) ?? null);
        const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", user.id);
        if (mounted) setIsAdmin(Array.isArray(roles) && roles.some((r: any) => r.role === "admin"));
      } else {
        setProfile(null);
        setIsAdmin(false);
      }

      if (mounted) setLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (nextUser) {
        const { data } = await sb.from("profiles").select("*").eq("id", nextUser.id).single();
        if (mounted) setProfile((data as Profile | null) ?? null);
        const { data: roles } = await sb.from("user_roles").select("role").eq("user_id", nextUser.id);
        if (mounted) setIsAdmin(Array.isArray(roles) && roles.some((r: any) => r.role === "admin"));
      } else {
        setProfile(null);
        setIsAdmin(false);
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login({ nickname, password }: { nickname: string; password: string }) {
    const email = nicknameToEmail(nickname);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function register({
    nickname,
    password,
    audience,
    country,
  }: {
    nickname: string;
    password: string;
    audience: "women" | "girls";
    country?: string;
  }) {
    const { email } = await registerAnonymousUser({ data: { nickname, password, audience, country } });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  function errMsg(e: unknown) {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return "Something went wrong. Please try again.";
  }

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, login, register, logout, errMsg }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
