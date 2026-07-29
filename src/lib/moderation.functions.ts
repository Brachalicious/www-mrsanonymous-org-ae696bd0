import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SESSION_COOKIE = "mrsanon_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function sessionId(): string {
  let id = getCookie(SESSION_COOKIE);
  if (!id) {
    id = crypto.randomUUID();
    setCookie(SESSION_COOKIE, id, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return id;
}

export const REPORT_REASONS = [
  "Abusive or hateful content",
  "Identifying information about someone",
  "Spam or advertising",
  "Threat of violence or self-harm",
  "Sexual content involving a minor",
  "Something else",
];

export const reportStory = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        notebookId: z.string().uuid(),
        reason: z.string().min(1).max(120),
        details: z.string().max(1000).optional(),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const sid = sessionId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("story_reports").insert({
      notebook_id: data.notebookId,
      session_id: sid,
      reason: data.reason,
      details: data.details ?? null,
    });
    if (error) throw new Error(error.message);

    // Auto-hide pending review once a story has multiple independent reports.
    const { data: reports } = await supabaseAdmin
      .from("story_reports")
      .select("session_id")
      .eq("notebook_id", data.notebookId)
      .eq("status", "pending");
    const unique = new Set((reports ?? []).map((r: { session_id: string }) => r.session_id));
    if (unique.size >= 2) {
      await supabaseAdmin.from("notebooks").update({ hidden: true }).eq("id", data.notebookId);
    }
    return { ok: true };
  });

export const blockStoryAuthor = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ notebookId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const sid = sessionId();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: nb } = await supabaseAdmin
      .from("notebooks")
      .select("owner_id")
      .eq("id", data.notebookId)
      .maybeSingle();
    if (!nb) throw new Error("Story not found");
    await supabaseAdmin
      .from("story_blocks")
      .upsert({ session_id: sid, owner_id: nb.owner_id }, { onConflict: "session_id,owner_id" });
    return { ok: true };
  });

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden");
}

export const listStoryReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("story_reports")
      .select("id, notebook_id, reason, details, status, created_at, notebooks(title, hidden)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []) as any[];
  });

export const resolveStoryReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        reportId: z.string().uuid(),
        action: z.enum(["remove", "keep"]),
      })
      .parse(data)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: report } = await supabaseAdmin
      .from("story_reports")
      .select("notebook_id")
      .eq("id", data.reportId)
      .maybeSingle();
    if (!report) throw new Error("Report not found");

    await supabaseAdmin
      .from("notebooks")
      .update({ hidden: data.action === "remove" })
      .eq("id", report.notebook_id);
    await supabaseAdmin
      .from("story_reports")
      .update({ status: data.action === "remove" ? "removed" : "dismissed" })
      .eq("id", data.reportId);
    return { ok: true };
  });
