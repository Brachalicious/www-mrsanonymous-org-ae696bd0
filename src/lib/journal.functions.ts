import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const attachmentSchema = z.object({
  path: z.string().min(1).max(400),
  name: z.string().min(1).max(200),
  type: z.string().max(120).default(""),
  size: z.number().nonnegative().default(0),
});

const createSchema = z.object({
  audience: z.enum(["women", "girls"]).default("women"),
  fields: z.record(z.string(), z.string().max(8000)),
  attachments: z.array(attachmentSchema).max(20).default([]),
  audioPath: z.string().max(400).nullable().optional(),
});

export const listJournalEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, audience, fields, attachments, audio_path, created_at")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("journal_entries")
      .insert({
        owner_id: userId,
        audience: data.audience,
        fields: data.fields,
        attachments: data.attachments,
        audio_path: data.audioPath ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteJournalEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await supabase
      .from("journal_entries")
      .select("attachments, audio_path")
      .eq("id", data.id)
      .eq("owner_id", userId)
      .single();

    const paths: string[] = [];
    for (const a of (row?.attachments as { path?: string }[] | null) ?? []) {
      if (a?.path) paths.push(a.path);
    }
    if (row?.audio_path) paths.push(row.audio_path);
    if (paths.length) await supabase.storage.from("evidence").remove(paths);

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const appendJournalAttachment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        id: z.string().uuid(),
        attachment: attachmentSchema,
        fields: z.record(z.string(), z.string().max(8000)).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error: readError } = await supabase
      .from("journal_entries")
      .select("attachments, fields")
      .eq("id", data.id)
      .eq("owner_id", userId)
      .single();
    if (readError) throw new Error(readError.message);

    const existing = Array.isArray(row?.attachments) ? (row.attachments as unknown[]) : [];
    const patch: { attachments: unknown; fields?: unknown } = {
      attachments: [...existing, data.attachment].slice(0, 500),
    };
    if (data.fields) {
      patch['fields'] = { ...((row?.fields as Record<string, string>) ?? {}), ...data.fields };
    }

    const { error } = await supabase
      .from("journal_entries")
      .update(patch as never)
      .eq("id", data.id)
      .eq("owner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
