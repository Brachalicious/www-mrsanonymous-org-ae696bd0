import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      message: z.string().min(1).max(2000),
      audience: z.enum(["women", "girls"]).default("women"),
      userId: z.string().uuid().nullable().optional(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: inserted, error } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        message: data.message,
        audience: data.audience,
        sender_user_id: data.userId ?? null,
      })
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);

    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("contact-notification", "mrsanonymoussupport@gmail.com", {
        templateData: {
          message: data.message,
          audience: data.audience,
          receivedAt: inserted?.created_at ?? new Date().toISOString(),
          accountLinked: Boolean(data.userId),
        },
        idempotencyKey: `contact-notification-${inserted?.id ?? crypto.randomUUID()}`,
      });
    } catch (e) {
      // Never fail the user's submission because of a notification email problem.
      console.error("contact notification email failed", e);
    }
    return { ok: true };
  });

export const getUnreadMessageCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { count, error } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("sender_user_id", userId)
      .eq("status", "replied");
    if (error) throw new Error(error.message);
    return count ?? 0;
  });

export const listMyMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: messages, error } = await supabase
      .from("contact_messages")
      .select("id, message, audience, status, created_at")
      .eq("sender_user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (messages ?? []).map((m: any) => m.id);
    let replies: any[] = [];
    if (ids.length) {
      const { data: r } = await supabase
        .from("message_replies")
        .select("id, message_id, body, created_at, author_user_id")
        .in("message_id", ids)
        .order("created_at", { ascending: true });
      replies = r ?? [];
    }
    return (messages ?? []).map((m: any) => ({
      ...m,
      replies: replies
        .filter((r) => r.message_id === m.id)
        .map((r) => ({ ...r, fromMe: r.author_user_id === userId })),
    }));
  });

export const listAllMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: adminCheck } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!adminCheck) throw new Error("Forbidden");
    const { data: messages, error } = await supabase
      .from("contact_messages")
      .select("id, message, audience, status, created_at, sender_user_id")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (messages ?? []).map((m: any) => m.id);
    let replies: any[] = [];
    if (ids.length) {
      const { data: r } = await supabase
        .from("message_replies")
        .select("id, message_id, body, created_at, author_user_id")
        .in("message_id", ids)
        .order("created_at", { ascending: true });
      replies = r ?? [];
    }
    // fetch nicknames
    const userIds = Array.from(new Set((messages ?? []).map((m: any) => m.sender_user_id).filter(Boolean)));
    let nicks: Record<string, string> = {};
    if (userIds.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: profs } = await supabaseAdmin.from("profiles").select("id, nickname").in("id", userIds);
      for (const p of (profs ?? []) as any[]) nicks[p.id] = p.nickname ?? "friend";
    }
    return (messages ?? []).map((m: any) => ({
      ...m,
      sender_nickname: m.sender_user_id ? nicks[m.sender_user_id] ?? null : null,
      replies: replies.filter((r) => r.message_id === m.id),
    }));
  });

export const replyAsUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ messageId: z.string().uuid(), body: z.string().trim().min(1).max(4000) }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: owned, error: ownErr } = await supabase
      .from("contact_messages")
      .select("id")
      .eq("id", data.messageId)
      .eq("sender_user_id", userId)
      .maybeSingle();
    if (ownErr) throw new Error(ownErr.message);
    if (!owned) throw new Error("Not found");

    const { error } = await supabase.from("message_replies").insert({
      message_id: data.messageId,
      author_user_id: userId,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    await supabase.from("contact_messages").update({ status: "open" }).eq("id", data.messageId);

    try {
      const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
      await sendTemplateEmail("contact-notification", "mrsanonymoussupport@gmail.com", {
        templateData: {
          message: data.body,
          audience: "reply in existing thread",
          receivedAt: new Date().toISOString(),
          accountLinked: true,
        },
        idempotencyKey: `user-reply-${data.messageId}-${Date.now()}`,
      });
    } catch (e) {
      console.error("user reply notification email failed", e);
    }
    return { ok: true };
  });

export const replyToMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ messageId: z.string().uuid(), body: z.string().min(1).max(4000) }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: adminCheck } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!adminCheck) throw new Error("Forbidden");
    const { error } = await supabase.from("message_replies").insert({
      message_id: data.messageId,
      author_user_id: userId,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    await supabase.from("contact_messages").update({ status: "replied" }).eq("id", data.messageId);
    return { ok: true };
  });
