import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: notebooks } = await supabaseAdmin
      .from("notebooks")
      .select("id")
      .eq("owner_id", userId);
    const ids = (notebooks ?? []).map((n: { id: string }) => n.id);
    if (ids.length) {
      await supabaseAdmin.from("entries").delete().in("notebook_id", ids);
      await supabaseAdmin.from("reaction_events").delete().in("notebook_id", ids);
      await supabaseAdmin.from("notebooks").delete().in("id", ids);
    }
    await supabaseAdmin.from("security_questions").delete().eq("user_id", userId);
    const { data: files } = await supabaseAdmin.storage.from("evidence").list(userId, { limit: 1000 });
    if (files?.length) {
      await supabaseAdmin.storage.from("evidence").remove(files.map((f) => `${userId}/${f.name}`));
    }
    await supabaseAdmin.from("journal_entries").delete().eq("owner_id", userId);
    await supabaseAdmin.from("contact_messages").delete().eq("sender_user_id", userId);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return { ok: true };
  });
