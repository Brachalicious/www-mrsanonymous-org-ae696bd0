import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function nicknameToEmail(nickname: string) {
  return `${nickname.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}@mrsanonymous.local`;
}

const registerSchema = z.object({
  nickname: z.string().min(2).max(40),
  password: z.string().min(1).max(128),
  audience: z.enum(["women", "girls"]).default("women"),
  country: z.string().min(2).max(3).optional(),
  state_region: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
});

export const registerAnonymousUser = createServerFn({ method: "POST" })
  .inputValidator((data) => registerSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const email = nicknameToEmail(data.nickname);
    const normalizedNickname = data.nickname.toLowerCase().trim();

    // Check if a profile already exists for this nickname.
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("nickname", normalizedNickname)
      .maybeSingle();

    if (existing) {
      throw new Error("That nickname is already taken. Please choose another.");
    }

    // Create the auth user with auto-confirmed email.
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: true,
      user_metadata: { nickname: normalizedNickname },
    });

    if (createError || !userData.user) {
      throw new Error(createError?.message ?? "Could not create account.");
    }

    // Create profile row.
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: userData.user.id,
      nickname: normalizedNickname,
      audience: data.audience,
      country: data.country ?? null,
      state_region: data.state_region?.trim() || null,
      city: data.city?.trim() || null,
    });


    if (profileError) {
      // Best-effort cleanup on conflict so the user can retry.
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw new Error(profileError.message);
    }

    return { email };
  });

export const loginWithNickname = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({
      nickname: z.string(),
      password: z.string(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const email = nicknameToEmail(data.nickname);
    return { email };
  });

export const checkNicknameAvailable = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({
      nickname: z.string().min(2).max(40),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("nickname", data.nickname.toLowerCase().trim())
      .maybeSingle();
    return { available: !existing };
  });


