import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyInboxLock = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("inbox_recovery_locks")
      .select("status, method, created_at, verified_at")
      .eq("user_id", userId)
      .maybeSingle();
    return { locked: data?.status === "pending", lock: data ?? null };
  });

export const raiseInboxLock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ method: z.string().min(1).max(80) }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("inbox_recovery_locks")
      .upsert(
        {
          user_id: userId,
          method: data.method,
          status: "pending",
          created_at: new Date().toISOString(),
          verified_at: null,
          verified_by: null,
        },
        { onConflict: "user_id" }
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listInboxLocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("inbox_recovery_locks")
      .select("user_id, method, status, created_at, verified_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (data ?? []).map((r: any) => r.user_id);
    const nicks: Record<string, string> = {};
    if (ids.length) {
      const { data: profs } = await supabaseAdmin.from("profiles").select("id, nickname").in("id", ids);
      for (const p of (profs ?? []) as any[]) nicks[p.id] = p.nickname ?? "friend";
    }
    return (data ?? []).map((r: any) => ({ ...r, nickname: nicks[r.user_id] ?? null }));
  });

export const setInboxLockStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ userId: z.string().uuid(), status: z.enum(["pending", "verified"]) }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("inbox_recovery_locks")
      .update({
        status: data.status,
        verified_at: data.status === "verified" ? new Date().toISOString() : null,
        verified_by: data.status === "verified" ? userId : null,
      })
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
