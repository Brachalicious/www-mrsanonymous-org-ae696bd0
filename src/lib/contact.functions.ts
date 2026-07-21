import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const sendContactMessage = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      message: z.string().min(1).max(2000),
      audience: z.enum(["women", "girls"]).default("women"),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      message: data.message,
      audience: data.audience,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
