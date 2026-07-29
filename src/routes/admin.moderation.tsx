import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { listStoryReports, resolveStoryReport } from "@/lib/moderation.functions";

export const Route = createFileRoute("/admin/moderation")({
  head: () => ({
    meta: [
      { title: "Moderation Queue — MrsANONymous" },
      { name: "description", content: "Support team review queue for reported community stories." },
      { property: "og:title", content: "Moderation Queue — MrsANONymous" },
      { property: "og:description", content: "Support team review queue for reported stories." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModerationPage,
});

function ModerationPage() {
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();
  const fetchReports = useServerFn(listStoryReports);
  const resolve = useServerFn(resolveStoryReport);

  const q = useQuery({
    queryKey: ["story-reports"],
    queryFn: () => fetchReports(),
    enabled: !!user && isAdmin,
  });

  const mutation = useMutation({
    mutationFn: resolve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-reports"] });
      queryClient.invalidateQueries({ queryKey: ["shared-stories"] });
    },
  });

  if (loading) return <div className="mx-auto max-w-3xl px-5 py-16 text-ink-500">Loading…</div>;
  if (!user || !isAdmin) {
    return <div className="mx-auto max-w-3xl px-5 py-16 text-ink-700">Support team only.</div>;
  }

  const reports = (q.data as any[]) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-10">
      <h1 className="font-serif text-4xl text-ink-900">Moderation Queue</h1>
      <p className="mt-2 text-ink-700">Reported stories. Target response time: 24 hours.</p>

      {q.isLoading && <p className="mt-6 text-ink-500">Loading…</p>}
      {!q.isLoading && reports.length === 0 && (
        <div className="note-card mt-8 p-6 text-ink-700">Nothing reported. 🌿</div>
      )}

      <div className="mt-8 space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="note-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-lg text-ink-900">{r.notebooks?.title ?? "Untitled story"}</h2>
              <span className="rounded-full border border-ink-300 px-3 py-1 text-xs text-ink-600">
                {r.status}{r.notebooks?.hidden ? " · hidden" : ""}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-rose-600">{r.reason}</p>
            {r.details && <p className="mt-1 text-sm text-ink-700">{r.details}</p>}
            <p className="mt-1 text-xs text-ink-400">{new Date(r.created_at).toLocaleString()}</p>
            {r.status === "pending" && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => mutation.mutate({ data: { reportId: r.id, action: "remove" } })}
                  className="rounded-full bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white"
                >
                  Remove story
                </button>
                <button
                  onClick={() => mutation.mutate({ data: { reportId: r.id, action: "keep" } })}
                  className="rounded-full border border-ink-300 px-4 py-1.5 text-xs font-semibold text-ink-700"
                >
                  Keep — no violation
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
