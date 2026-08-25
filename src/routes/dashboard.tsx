import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  FileText,
  Inbox,
  LifeBuoy,
  MessageSquare,
  Notebook,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — MrsANONymous.org" },
      {
        name: "description",
        content:
          "Your private hub: notebooks, journal, safety plan, incident reports, resources, and support messages — all in one place.",
      },
      { property: "og:title", content: "Your dashboard — MrsANONymous.org" },
      {
        property: "og:description",
        content:
          "Your private hub: notebooks, journal, safety plan, incident reports, resources, and support messages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

type Option = {
  to: string;
  search?: Record<string, string>;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tone: string;
  testid: string;
};

function DashboardPage() {
  const { user, profile } = useAuth();

  const options: Option[] = [
    {
      to: "/tell-your-story",
      title: "Tell your story",
      desc: "Write privately, or share anonymously to the community board.",
      icon: <Notebook className="h-6 w-6 text-rose-600" />,
      tone: "bg-rose-100",
      testid: "dash-tell-story",
    },
    {
      to: "/tell-your-story",
      search: { tab: "mine" },
      title: "My notebooks",
      desc: "Your saved drafts and private notebooks, with custom covers.",
      icon: <BookOpen className="h-6 w-6 text-ink-900" />,
      tone: "bg-cream-200",
      testid: "dash-notebooks",
    },
    {
      to: "/journal",
      title: "Private journal & body cam",
      desc: "Document incidents with notes, photos, audio, and auto-saved video.",
      icon: <FileText className="h-6 w-6 text-rose-600" />,
      tone: "bg-rose-100",
      testid: "dash-journal",
    },
    {
      to: "/safety-plan",
      title: "My safety plan",
      desc: "Build a personal plan. Saved only on this device, printable anytime.",
      icon: <ShieldCheck className="h-6 w-6 text-ink-900" />,
      tone: "bg-cream-200",
      testid: "dash-safety-plan",
    },
    {
      to: "/tools",
      title: "Safety tools",
      desc: "Quick exit, silent panic, SOFY mode, and private browsing help.",
      icon: <Wrench className="h-6 w-6 text-rose-600" />,
      tone: "bg-rose-100",
      testid: "dash-tools",
    },
    {
      to: "/resources",
      title: "Resources near you",
      desc: "Hotlines, shelters, and legal help for your country and language.",
      icon: <LifeBuoy className="h-6 w-6 text-ink-900" />,
      tone: "bg-cream-200",
      testid: "dash-resources",
    },
    {
      to: "/board",
      title: "The board",
      desc: "Read anonymous stories from other women and girls.",
      icon: <Users className="h-6 w-6 text-rose-600" />,
      tone: "bg-rose-100",
      testid: "dash-board",
    },
    {
      to: "/inbox",
      title: "Messages",
      desc: "Private replies from our support team — no email needed.",
      icon: <Inbox className="h-6 w-6 text-ink-900" />,
      tone: "bg-cream-200",
      testid: "dash-inbox",
    },
    {
      to: "/contact",
      title: "Contact support",
      desc: "Send an anonymous message. We reply right inside the app.",
      icon: <MessageSquare className="h-6 w-6 text-rose-600" />,
      tone: "bg-rose-100",
      testid: "dash-contact",
    },
    {
      to: "/settings",
      title: "Settings & privacy",
      desc: "Disguise mode, location, security questions, and account options.",
      icon: <Settings className="h-6 w-6 text-ink-900" />,
      tone: "bg-cream-200",
      testid: "dash-settings",
    },
  ];

  return (
    <div className="paper-bg min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-12 lg:px-10">
        <div className="mb-10">
          <span className="hand-note text-2xl">welcome back</span>
          <h1 className="mt-2 font-serif text-4xl text-ink-900">
            {profile?.nickname ? `Hi, ${profile.nickname}` : "Your dashboard"}
          </h1>
          <p className="mt-3 max-w-2xl text-ink-600">
            Everything in one place. Nothing here is shared unless you choose to
            share it.
          </p>
          {!user && (
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/signup" className="btn-rose">
                Create an anonymous account
              </Link>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {options.map((o) => (
            <Link
              key={o.testid}
              to={o.to}
              search={o.search as never}
              data-testid={o.testid}
              className="note-card group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${o.tone}`}
              >
                {o.icon}
              </span>
              <span className="font-serif text-lg text-ink-900">{o.title}</span>
              <span className="text-sm leading-relaxed text-ink-600">{o.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
