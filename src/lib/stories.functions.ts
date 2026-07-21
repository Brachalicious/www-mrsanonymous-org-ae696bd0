import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

const REACTIONS = [
  { key: "strong", label: "Strong", emoji: "🌿" },
  { key: "proud", label: "Proud", emoji: "🌸" },
  { key: "gotthis", label: "Got This", emoji: "💪" },
  { key: "thankyou", label: "Thank You", emoji: "🙏" },
  { key: "warrior", label: "Warrior", emoji: "🛡️" },
  { key: "love", label: "Love", emoji: "💜" },
  { key: "notalone", label: "Not Alone", emoji: "🤝" },
  { key: "brave", label: "Brave", emoji: "🔥" },
];

const SESSION_COOKIE = "mrsanon_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const sendReactionSchema = z.object({
  notebookId: z.string().uuid(),
  reaction: z.string().min(1).max(32),
});

const storyIdSchema = z.object({ id: z.string().uuid() });

function getSessionId(): string {
  let sessionId = getCookie(SESSION_COOKIE);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    setCookie(SESSION_COOKIE, sessionId, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return sessionId;
}

export const listSharedStories = createServerFn({ method: "GET" }).handler(async () => {
  const sessionId = getSessionId();

  const { data: notebooks, error: nbError } = await supabase
    .from("notebooks")
    .select(
      "*, profiles!inner(nickname)"
    )
    .eq("shared", true)
    .order("shared_at", { ascending: false })
    .limit(60);
  if (nbError) throw new Error(nbError.message);

  const stories = (notebooks || []) as unknown as Array<
    Database["public"]["Tables"]["notebooks"]["Row"] & { profiles: { nickname: string } }
  >;
  if (stories.length === 0) return [];

  const ids = stories.map((s) => s.id);

  const [{ data: entries }, { data: reactionEvents }] = await Promise.all([
    supabase.from("entries").select("notebook_id, content").in("notebook_id", ids).eq("shared", true),
    supabase.from("reaction_events").select("notebook_id, reaction, session_id").in("notebook_id", ids),
  ]);

  const firstEntryMap = new Map<string, string>();
  (entries || []).forEach((row: { notebook_id: string; content: string }) => {
    if (!firstEntryMap.has(row.notebook_id)) {
      firstEntryMap.set(row.notebook_id, row.content.slice(0, 240));
    }
  });

  const countsMap = new Map<string, Map<string, number>>();
  const reactedMap = new Map<string, Set<string>>();
  (reactionEvents || []).forEach((row: { notebook_id: string; reaction: string; session_id: string }) => {
    if (!countsMap.has(row.notebook_id)) countsMap.set(row.notebook_id, new Map());
    const m = countsMap.get(row.notebook_id)!;
    m.set(row.reaction, (m.get(row.reaction) || 0) + 1);

    if (row.session_id === sessionId) {
      if (!reactedMap.has(row.notebook_id)) reactedMap.set(row.notebook_id, new Set());
      reactedMap.get(row.notebook_id)!.add(row.reaction);
    }
  });

  return stories.map((s) => {
    const counts = countsMap.get(s.id);
    const myReactions = reactedMap.get(s.id);
    return {
      id: s.id,
      title: s.title,
      color: s.color,
      topics: s.topics || [],
      share_as: s.share_as,
      author: s.share_as === "nickname" ? s.profiles.nickname : "Anonymous",
      created_at: s.created_at,
      shared_at: s.shared_at,
      preview: firstEntryMap.get(s.id) || "",
      reactions: REACTIONS.map((r) => ({
        ...r,
        count: counts?.get(r.key) || 0,
        active: myReactions?.has(r.key) || false,
      })),
    };
  });
});

export const getSharedStory = createServerFn({ method: "GET" })
  .inputValidator((data) => storyIdSchema.parse(data))
  .handler(async ({ data }) => {
    const sessionId = getSessionId();

    const { data: notebook, error: nbError } = await supabase
      .from("notebooks")
      .select("*, profiles!inner(nickname)")
      .eq("id", data.id)
      .eq("shared", true)
      .single();
    if (nbError || !notebook) throw new Error("Story not found");

    const story = notebook as unknown as Database["public"]["Tables"]["notebooks"]["Row"] & {
      profiles: { nickname: string };
    };

    const [{ data: entries }, { data: reactionEvents }] = await Promise.all([
      supabase.from("entries").select("*").eq("notebook_id", data.id).eq("shared", true).order("created_at", { ascending: false }),
      supabase.from("reaction_events").select("reaction, session_id").eq("notebook_id", data.id),
    ]);

    const counts = new Map<string, number>();
    const myReactions = new Set<string>();
    (reactionEvents || []).forEach((row: { reaction: string; session_id: string }) => {
      counts.set(row.reaction, (counts.get(row.reaction) || 0) + 1);
      if (row.session_id === sessionId) myReactions.add(row.reaction);
    });

    return {
      id: story.id,
      title: story.title,
      color: story.color,
      topics: story.topics || [],
      share_as: story.share_as,
      author: story.share_as === "nickname" ? story.profiles.nickname : "Anonymous",
      created_at: story.created_at,
      shared_at: story.shared_at,
      entries: (entries || []).map((e) => ({
        id: e.id,
        content: e.content,
        mood: e.mood,
        created_at: e.created_at,
      })),
      reactions: REACTIONS.map((r) => ({
        ...r,
        count: counts.get(r.key) || 0,
        active: myReactions.has(r.key) || false,
      })),
    };
  });

export const sendReaction = createServerFn({ method: "POST" })
  .inputValidator((data) => sendReactionSchema.parse(data))
  .handler(async ({ data }) => {
    const sessionId = getSessionId();
    const reaction = data.reaction.trim().toLowerCase();

    const { data: existing } = await supabase
      .from("reaction_events")
      .select("id")
      .eq("notebook_id", data.notebookId)
      .eq("session_id", sessionId)
      .eq("reaction", reaction)
      .maybeSingle();

    if (existing) {
      await supabase.from("reaction_events").delete().eq("id", existing.id);
    } else {
      await supabase.from("reaction_events").insert({
        notebook_id: data.notebookId,
        session_id: sessionId,
        reaction,
      });
    }

    const { data: reactionEvents } = await supabase
      .from("reaction_events")
      .select("reaction, session_id")
      .eq("notebook_id", data.notebookId);

    const counts = new Map<string, number>();
    const myReactions = new Set<string>();
    (reactionEvents || []).forEach((row: { reaction: string; session_id: string }) => {
      counts.set(row.reaction, (counts.get(row.reaction) || 0) + 1);
      if (row.session_id === sessionId) myReactions.add(row.reaction);
    });

    return {
      notebookId: data.notebookId,
      reactions: REACTIONS.map((r) => ({
        ...r,
        count: counts.get(r.key) || 0,
        active: myReactions.has(r.key) || false,
      })),
    };
  });

export const storyReactions = REACTIONS;
