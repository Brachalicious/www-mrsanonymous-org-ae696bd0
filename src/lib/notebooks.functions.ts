import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type NotebookUpdate = Database["public"]["Tables"]["notebooks"]["Update"];
type EntryUpdate = Database["public"]["Tables"]["entries"]["Update"];

type FnContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
  claims: Record<string, unknown>;
};

const MAX_TOPICS = 8;
const ALLOWED_TOPICS = [
  "Sexual abuse",
  "Physical abuse",
  "Emotional / verbal abuse",
  "Financial abuse",
  "Neglect",
  "Abandonment",
  "Coercive control",
  "Stalking / harassment",
  "Childhood abuse",
  "Trafficking / exploitation",
  "Spiritual / religious abuse",
  "Other",
];

const topicSchema = z.array(z.string()).max(MAX_TOPICS).default([]);

function normalizeTopics(topics: string[]) {
  return topics
    .map((t) => t.trim())
    .filter((t) => t && ALLOWED_TOPICS.includes(t))
    .slice(0, MAX_TOPICS);
}

const createNotebookSchema = z.object({
  title: z.string().min(1).max(120),
  color: z.string().max(512).default("#B91C1C"),
});

const notebookIdSchema = z.object({ id: z.string().uuid() });

const updateNotebookSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(120).optional(),
  color: z.string().max(512).optional(),
});

const shareNotebookSchema = z.object({
  id: z.string().uuid(),
  shared: z.boolean(),
  shareAs: z.enum(["nickname", "anonymous"]).default("anonymous"),
  topics: topicSchema,
});

const createEntrySchema = z.object({
  notebookId: z.string().uuid(),
  content: z.string().min(1).max(20000),
  mood: z.string().max(32).optional(),
});

const updateEntrySchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(20000).optional(),
  mood: z.string().max(32).optional().nullable(),
});

const shareEntrySchema = z.object({
  id: z.string().uuid(),
  shared: z.boolean(),
  shareAs: z.enum(["nickname", "anonymous"]).default("anonymous"),
  topics: topicSchema,
});

async function verifyEntryOwnership(context: FnContext, entryId: string) {
  const { data: row } = await context.supabase
    .from("entries")
    .select("id, notebooks!inner(owner_id)")
    .eq("id", entryId)
    .single<{ id: string; notebooks: { owner_id: string } }>();
  if (!row) throw new Error("Entry not found");
  if (row.notebooks.owner_id !== context.userId) throw new Error("Forbidden");
}

export const listMyNotebooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notebooks")
      .select("*")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const notebooks = data || [];
    if (notebooks.length === 0) return [];

    const ids = notebooks.map((n) => n.id);
    const { data: entries } = await context.supabase
      .from("entries")
      .select("notebook_id")
      .in("notebook_id", ids);

    const countMap = new Map<string, number>();
    (entries || []).forEach((row: { notebook_id: string }) => {
      countMap.set(row.notebook_id, (countMap.get(row.notebook_id) || 0) + 1);
    });

    return notebooks.map((n) => ({ ...n, entry_count: countMap.get(n.id) || 0 }));
  });

export const createNotebook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createNotebookSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: inserted, error } = await context.supabase
      .from("notebooks")
      .insert({
        owner_id: context.userId,
        title: data.title.trim(),
        color: data.color,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { ...inserted, entry_count: 0 };
  });

export const deleteNotebook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => notebookIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("notebooks")
      .delete()
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getNotebook = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => notebookIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: notebook, error } = await context.supabase
      .from("notebooks")
      .select("*")
      .eq("id", data.id)
      .eq("owner_id", context.userId)
      .single();
    if (error) throw new Error(error.message);
    return notebook;
  });

export const updateNotebook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateNotebookSchema.parse(data))
  .handler(async ({ data, context }) => {
    const update: NotebookUpdate = {};
    if (data.title !== undefined) update.title = data.title.trim();
    if (data.color !== undefined) update.color = data.color;
    const { error } = await context.supabase
      .from("notebooks")
      .update(update)
      .eq("id", data.id)
      .eq("owner_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const shareNotebook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => shareNotebookSchema.parse(data))
  .handler(async ({ data, context }) => {
    const update: NotebookUpdate = {
      shared: data.shared,
      share_as: data.shared ? data.shareAs : "anonymous",
      shared_at: data.shared ? new Date().toISOString() : null,
      topics: data.shared ? normalizeTopics(data.topics) : [],
    };
    const { data: updated, error } = await context.supabase
      .from("notebooks")
      .update(update)
      .eq("id", data.id)
      .eq("owner_id", context.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

export const listEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => notebookIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: notebook, error: nbError } = await context.supabase
      .from("notebooks")
      .select("id")
      .eq("id", data.id)
      .eq("owner_id", context.userId)
      .single();
    if (nbError || !notebook) throw new Error("Notebook not found");

    const { data: entries, error } = await context.supabase
      .from("entries")
      .select("*")
      .eq("notebook_id", data.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return entries || [];
  });

export const createEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createEntrySchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: notebook, error: nbError } = await context.supabase
      .from("notebooks")
      .select("id")
      .eq("id", data.notebookId)
      .eq("owner_id", context.userId)
      .single();
    if (nbError || !notebook) throw new Error("Notebook not found");

    const { data: inserted, error } = await context.supabase
      .from("entries")
      .insert({
        notebook_id: data.notebookId,
        content: data.content.trim(),
        mood: data.mood?.trim() || null,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return inserted;
  });

export const updateEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => updateEntrySchema.parse(data))
  .handler(async ({ data, context }) => {
    await verifyEntryOwnership(context as FnContext, data.id);
    const update: EntryUpdate = {};
    if (data.content !== undefined) update.content = data.content.trim();
    if (data.mood !== undefined) update.mood = data.mood ? data.mood.trim() : null;
    const { data: updated, error } = await context.supabase
      .from("entries")
      .update(update)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });

export const deleteEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => notebookIdSchema.parse(data))
  .handler(async ({ data, context }) => {
    await verifyEntryOwnership(context as FnContext, data.id);
    const { error } = await context.supabase
      .from("entries")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const shareEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => shareEntrySchema.parse(data))
  .handler(async ({ data, context }) => {
    await verifyEntryOwnership(context as FnContext, data.id);
    const update: EntryUpdate = {
      shared: data.shared,
      share_as: data.shared ? data.shareAs : "anonymous",
      shared_at: data.shared ? new Date().toISOString() : null,
      topics: data.shared ? normalizeTopics(data.topics) : [],
    };
    const { data: updated, error } = await context.supabase
      .from("entries")
      .update(update)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return updated;
  });
