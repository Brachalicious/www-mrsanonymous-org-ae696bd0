import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { pbkdf2Sync, randomBytes } from "node:crypto";

function nicknameToEmail(nickname: string) {
  return `${nickname.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}@mrsanonymous.local`;
}

function normalizeAnswer(a: string) {
  return a.trim().toLowerCase().replace(/\s+/g, " ");
}

function hashAnswer(answer: string, salt: string) {
  return pbkdf2Sync(normalizeAnswer(answer), salt, 100_000, 32, "sha256").toString("hex");
}

function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const saveSchema = z.object({
  question_1: z.string().trim().min(1).max(200),
  question_2: z.string().trim().min(1).max(200),
  question_3: z.string().trim().min(1).max(200),
  answer_1: z.string().trim().min(1).max(200),
  answer_2: z.string().trim().min(1).max(200),
  answer_3: z.string().trim().min(1).max(200),
});

export const hasMyQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context.supabase as any)
      .from("security_questions")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { hasQuestions: !!data };
  });

export const saveMyQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => saveSchema.parse(data))
  .handler(async ({ data, context }) => {
    // Reject duplicates so all 3 must be distinct
    const qs = [data.question_1, data.question_2, data.question_3].map((q) => q.trim().toLowerCase());
    if (new Set(qs).size !== 3) throw new Error("Please use three different questions.");

    const salt = randomBytes(16).toString("hex");
    const row = {
      user_id: context.userId,
      question_1: data.question_1.trim(),
      question_2: data.question_2.trim(),
      question_3: data.question_3.trim(),
      answer_1_hash: hashAnswer(data.answer_1, salt),
      answer_2_hash: hashAnswer(data.answer_2, salt),
      answer_3_hash: hashAnswer(data.answer_3, salt),
      salt,
    };

    const { error } = await (context.supabase as any)
      .from("security_questions")
      .upsert(row, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getQuestionsForNickname = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ nickname: z.string().trim().min(1).max(80) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nickname = data.nickname.toLowerCase().trim();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .maybeSingle();
    if (!profile) throw new Error("No account with that nickname, or recovery is not set up.");

    const { data: sq } = await supabaseAdmin
      .from("security_questions")
      .select("question_1, question_2, question_3")
      .eq("user_id", (profile as any).id)
      .maybeSingle();
    if (!sq) throw new Error("Recovery is not set up for this account. Log in normally to add security questions.");

    return {
      questions: [
        (sq as any).question_1 as string,
        (sq as any).question_2 as string,
        (sq as any).question_3 as string,
      ],
    };
  });

const resetSchema = z.object({
  nickname: z.string().trim().min(1).max(80),
  answer_1: z.string().trim().min(1).max(200),
  answer_2: z.string().trim().min(1).max(200),
  answer_3: z.string().trim().min(1).max(200),
  new_password: z.string().min(1).max(128),
});

export const resetPasswordWithAnswers = createServerFn({ method: "POST" })
  .inputValidator((data) => resetSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const nickname = data.nickname.toLowerCase().trim();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .maybeSingle();
    if (!profile) throw new Error("Unable to verify your answers.");

    const userId = (profile as any).id as string;

    const { data: sq } = await supabaseAdmin
      .from("security_questions")
      .select("answer_1_hash, answer_2_hash, answer_3_hash, salt")
      .eq("user_id", userId)
      .maybeSingle();
    if (!sq) throw new Error("Recovery is not set up for this account.");

    const s = sq as any;
    const ok1 = timingSafeEq(hashAnswer(data.answer_1, s.salt), s.answer_1_hash);
    const ok2 = timingSafeEq(hashAnswer(data.answer_2, s.salt), s.answer_2_hash);
    const ok3 = timingSafeEq(hashAnswer(data.answer_3, s.salt), s.answer_3_hash);
    if (!(ok1 && ok2 && ok3)) throw new Error("One or more answers were incorrect.");

    const email = nicknameToEmail(nickname);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.new_password,
    });
    if (error) throw new Error(error.message);

    return { ok: true, email };
  });
export const getMyQuestions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await (context.supabase as any)
      .from("security_questions")
      .select("question_1, question_2, question_3")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!data) return { questions: null as string[] | null };
    return {
      questions: [data.question_1 as string, data.question_2 as string, data.question_3 as string],
    };
  });

export const verifyMyAnswers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        answer_1: z.string().trim().min(1).max(200),
        answer_2: z.string().trim().min(1).max(200),
        answer_3: z.string().trim().min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: sq } = await (context.supabase as any)
      .from("security_questions")
      .select("answer_1_hash, answer_2_hash, answer_3_hash, salt")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!sq) throw new Error("Recovery is not set up for this account.");
    const ok =
      timingSafeEq(hashAnswer(data.answer_1, sq.salt), sq.answer_1_hash) &&
      timingSafeEq(hashAnswer(data.answer_2, sq.salt), sq.answer_2_hash) &&
      timingSafeEq(hashAnswer(data.answer_3, sq.salt), sq.answer_3_hash);
    if (!ok) throw new Error("One or more answers were incorrect.");
    return { ok: true };
  });
