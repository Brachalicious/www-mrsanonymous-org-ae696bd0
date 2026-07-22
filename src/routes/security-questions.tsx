import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { SecurityQuestionsForm, type SecurityAnswers } from "@/components/SecurityQuestionsForm";
import { saveMyQuestions } from "@/lib/security-questions.functions";

const searchSchema = z.object({
  required: z.union([z.literal("1"), z.literal("0"), z.string()]).optional(),
  next: z.string().optional(),
});

export const Route = createFileRoute("/security-questions")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Security Questions — MrsAnonymous" },
      { name: "description", content: "Set the security questions used to recover your anonymous MrsAnonymous account." },
      { property: "og:title", content: "Security Questions — MrsAnonymous" },
      { property: "og:description", content: "Set up account recovery for your anonymous MrsAnonymous account." },
    ],
  }),
  component: SecurityQuestionsPage,
});

function SecurityQuestionsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate({ from: "/security-questions" });
  const search = Route.useSearch();
  const save = useServerFn(saveMyQuestions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="paper-bg">
        <div className="mx-auto max-w-md px-5 py-20 text-sm text-ink-500">Loading…</div>
      </div>
    );
  }

  const required = search.required === "1";

  async function onSubmit(values: SecurityAnswers) {
    setError("");
    setSaving(true);
    try {
      await save({ data: values });
      navigate({ to: search.next || "/tell-your-story", search: { tab: "mine" } as any });
    } catch (e: any) {
      setError(e?.message ?? "Could not save your questions.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="paper-bg">
      <div className="mx-auto max-w-lg px-5 py-16 lg:px-10">
        <span className="hand-note text-2xl">a way back in — just in case</span>
        <h1 className="mt-2 font-serif text-4xl text-ink-900">
          {required ? "Set up account recovery" : "Security questions"}
        </h1>
        <p className="mt-3 text-sm text-ink-700">
          Since we never asked for your email, these three questions are the <em>only</em> way to reset your password
          if you forget it. Pick answers only you would know.
        </p>

        <div className="mt-8">
          <SecurityQuestionsForm
            onSubmit={onSubmit}
            loading={saving}
            error={error}
            submitLabel={required ? "Save and continue" : "Save recovery questions"}
          />
        </div>

        {!required && (
          <p className="mt-4 text-sm text-ink-500">
            <Link to="/tell-your-story" search={{ tab: "mine" }} className="link-soft underline-offset-4 hover:underline">
              Back to my notebooks
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}