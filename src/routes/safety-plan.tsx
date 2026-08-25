import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/safety-plan")({
  component: SafetyPlanPage,
  head: () => ({
    meta: [
      { title: "My Safety Plan — Private Personal Safety Planner | MrsANONymous" },
      {
        name: "description",
        content:
          "Build a personal domestic violence safety plan covering home, family, technology, your partner and emotional safety. Saved only on your device, printable anytime.",
      },
      { property: "og:title", content: "My Safety Plan — Private Safety Planner" },
      {
        property: "og:description",
        content:
          "A free, private safety plan you can fill in, save on your own device, and print. Nothing is sent to us.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Field = { id: string; label: string; type?: "text" | "textarea" | "yesno" };
type Section = { id: string; tab: string; title: string; blurb: string; fields: Field[] };

const SECTIONS: Section[] = [
  {
    id: "intro",
    tab: "Introduction",
    title: "Before you begin",
    blurb:
      "A safety plan is a personalized, practical plan that helps you stay safer while in a relationship, while planning to leave, or after you leave. Answer only what feels safe to answer — you can skip anything. Everything you type stays on this device only: it is never uploaded, never sent to us, and never attached to your account. If it is not safe to keep this on your device, print it and store it somewhere your partner cannot reach, or clear it with the Erase button below.",
    fields: [
      { id: "intro_why", label: "What made you start a safety plan today?", type: "textarea" },
      { id: "intro_biggest_risk", label: "What worries you the most right now?", type: "textarea" },
    ],
  },
  {
    id: "basics",
    tab: "Basics",
    title: "The basics",
    blurb: "General details that shape what help is available to you.",
    fields: [
      { id: "zip", label: "City / ZIP code where you live" },
      { id: "school", label: "Do you attend school? Where?" },
      { id: "job", label: "Do you have a job? Where?" },
      { id: "children", label: "Do you have children? How many?" },
      { id: "children_ages", label: "Children's ages" },
      { id: "orientation", label: "Sexual orientation / gender identity (only if it affects your safety)" },
      { id: "told_family", label: "Have you told family about the relationship? Who knows?", type: "textarea" },
    ],
  },
  {
    id: "home",
    tab: "Home / Family",
    title: "Home and family",
    blurb: "Where you can go, who you can call, and what you need to take with you.",
    fields: [
      { id: "safe_word_has", label: "Do you have a safe word with someone you trust?", type: "yesno" },
      { id: "safe_word", label: "Your safe word or code phrase" },
      { id: "who_stay", label: "Who could you stay with?", type: "textarea" },
      { id: "where_stay", label: "Where else could you stay (shelter, hotel, relative)?", type: "textarea" },
      { id: "safe_public", label: "Safe public place you can go to right now" },
      { id: "emergency_items", label: "Emergency bag items (ID, cash, meds, keys, documents, chargers)", type: "textarea" },
      { id: "emergency_items_other", label: "Other items you must not leave behind", type: "textarea" },
      { id: "protection_order", label: "Do you have a protection / restraining order?", type: "yesno" },
      { id: "protection_other", label: "Protection order details (case number, who has a copy)", type: "textarea" },
      { id: "who_know_going", label: "Who will you let know where you are going?" },
      { id: "emergency_pickup", label: "Who is your emergency pickup person?" },
      { id: "kids_911", label: "Do your children know how to call 911?", type: "yesno" },
      { id: "kids_code_word", label: "Children's code word (means: get out / get help)" },
      { id: "kids_safe_place", label: "Children's safe place in the home and outside the home", type: "textarea" },
      { id: "childcare", label: "Childcare backup plan", type: "textarea" },
    ],
  },
  {
    id: "tech",
    tab: "Technology",
    title: "Technology safety",
    blurb: "Phones, accounts and devices are the most common way an abusive partner keeps track of someone.",
    fields: [
      { id: "cell_phone", label: "Do you have your own cell phone?", type: "yesno" },
      { id: "same_plan", label: "Is your phone on the same plan as your partner?", type: "yesno" },
      { id: "phone_checked", label: "Has your partner checked your phone?", type: "yesno" },
      { id: "social_media", label: "Which social media accounts do you use?", type: "textarea" },
      { id: "abusive_texts", label: "Has your partner sent abusive texts or messages? (screenshot and save them)", type: "yesno" },
      { id: "shared_passwords", label: "Which passwords are shared or known to your partner?", type: "textarea" },
      { id: "account_access", label: "Who else has trusted access to your online accounts?", type: "textarea" },
      { id: "impersonation", label: "Has your partner pretended to be you online?", type: "yesno" },
      { id: "private_photos", label: "Does your partner have private photos of you?", type: "yesno" },
      { id: "threat_reveal", label: "Has your partner threatened to reveal photos, messages or personal information?", type: "yesno" },
    ],
  },
  {
    id: "partner",
    tab: "Partner",
    title: "School, work and your partner",
    blurb: "Places you go on a routine are places you can be found. Vary them where you can.",
    fields: [
      { id: "route_school", label: "Alternate route to and from school" },
      { id: "told_campus", label: "Have you told campus security or a counselor about the relationship?", type: "yesno" },
      { id: "school_time", label: "Who do you spend time with between classes?" },
      { id: "school_pickup", label: "Who handles school pickup?" },
      { id: "route_work", label: "Alternate route to and from work" },
      { id: "told_work", label: "Have you told anyone at work about the relationship?", type: "yesno" },
      { id: "partner_work", label: "Does your partner work at the same place?", type: "yesno" },
      { id: "work_pickup", label: "Who can pick you up from work?" },
      { id: "where_end", label: "Where is a safe place to end the relationship (public, with people nearby)?", type: "textarea" },
      { id: "who_talk_after", label: "Who will you talk to right after the breakup?", type: "textarea" },
    ],
  },
  {
    id: "emotional",
    tab: "Emotional",
    title: "Emotional safety",
    blurb: "Safety planning is exhausting. Plan for how you will take care of yourself too.",
    fields: [
      { id: "hurtful_things", label: "What hurtful things does your partner say that stay with you?", type: "textarea" },
      { id: "counter_thoughts", label: "What is true about you, instead?", type: "textarea" },
      { id: "enjoyable", label: "Activities that make you feel like yourself", type: "textarea" },
      { id: "cheer_up", label: "Who can you call when you need cheering up?", type: "textarea" },
      { id: "grounding", label: "What helps you calm down when you are overwhelmed?", type: "textarea" },
    ],
  },
];

const STORAGE_KEY = "mrsanon:safety-plan:v1";
const TABS = SECTIONS.map((s) => s.tab);

function SafetyPlanPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState(TABS[0]);
  const [loaded, setLoaded] = useState(false);
  const [savedAt, setSavedAt] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setValues(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
      setSavedAt(new Date().toLocaleTimeString());
    } catch {
      /* ignore */
    }
  }, [values, loaded]);

  const set = (id: string, v: string) => setValues((p) => ({ ...p, [id]: v }));

  const filled = Object.values(values).filter((v) => v && v.trim()).length;
  const total = SECTIONS.reduce((n, s) => n + s.fields.length, 0);
  const section = SECTIONS.find((s) => s.tab === active)!;

  function erase() {
    if (!confirm("Erase your entire safety plan from this device? This cannot be undone.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setValues({});
  }

  return (
    <div className="paper-bg">
      <div className="mx-auto max-w-4xl px-5 py-16 lg:px-10">
        <span className="hand-note text-2xl">your plan, your device</span>
        <h1 className="mt-2 font-serif text-5xl text-ink-900 sm:text-6xl">My Safety Plan</h1>
        <p className="mt-4 font-serif text-2xl italic text-rose-500">
          Your safety is top priority. Keep this document in a safe place.
        </p>

        <div className="mt-6 rounded-2xl border-2 border-ink-900 bg-white p-5 text-sm leading-relaxed text-ink-700 print:hidden">
          <strong className="text-ink-900">Nothing here leaves your device.</strong> Your answers are stored only in this
          browser — not in your account, not on our servers. Anyone with access to this device could open it, so print it
          and hide the paper copy if that is safer, then press <em>Erase this plan</em>.
        </div>

        {/* Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 print:hidden">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              data-testid={`safety-tab-${t.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${
                active === t
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-ink-900/20 bg-white text-ink-700 hover:border-rose-500 hover:text-rose-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-500 print:hidden">
          <span>
            {filled} of {total} answered
          </span>
          {savedAt && <span className="text-rose-500">Saved on this device at {savedAt}</span>}
        </div>

        {/* Active section (screen) */}
        <section className="mt-8 print:hidden">
          <h2 className="font-serif text-3xl text-ink-900">{section.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-700">{section.blurb}</p>
          <div className="mt-6 space-y-5">
            {section.fields.map((f) => (
              <FieldInput key={f.id} field={f} value={values[f.id] ?? ""} onChange={(v) => set(f.id, v)} />
            ))}
          </div>
        </section>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap gap-3 print:hidden">
          <button type="button" onClick={() => window.print()} data-testid="safety-plan-print" className="btn-rose">
            🖨️ Print my plan
          </button>
          <button type="button" onClick={erase} data-testid="safety-plan-erase" className="btn-ghost">
            Erase this plan
          </button>
          <a href="tel:18007997233" className="btn-ghost">
            Talk it through: 1-800-799-7233
          </a>
        </div>

        {/* Print view: everything */}
        <div className="hidden print:block">
          <h2 className="font-serif text-2xl">My Safety Plan</h2>
          {SECTIONS.map((s) => (
            <div key={s.id} className="mt-6 break-inside-avoid">
              <h3 className="font-serif text-xl">{s.title}</h3>
              <dl className="mt-2 space-y-2">
                {s.fields.map((f) => (
                  <div key={f.id}>
                    <dt className="text-xs font-bold uppercase tracking-wide">{f.label}</dt>
                    <dd className="border-b border-ink-300 pb-1 text-sm">{values[f.id] || " "}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "yesno") {
    return (
      <div className="note-card p-5">
        <div className="text-sm font-semibold text-ink-900">{field.label}</div>
        <div className="mt-3 flex gap-2">
          {["Yes", "No", "Not sure"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(value === opt ? "" : opt)}
              className={`rounded-full border-2 px-4 py-1.5 text-xs font-semibold transition ${
                value === opt
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-ink-900/15 bg-white text-ink-700 hover:border-rose-500"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="note-card p-5">
      <label className="block text-sm font-semibold text-ink-900" htmlFor={field.id}>
        {field.label}
      </label>
      {field.type === "textarea" ? (
        <textarea
          id={field.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-lg border border-ink-300 bg-white p-3 text-sm text-ink-900 focus:border-rose-500 focus:outline-none"
        />
      ) : (
        <input
          id={field.id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-3 w-full rounded-lg border border-ink-300 bg-white p-3 text-sm text-ink-900 focus:border-rose-500 focus:outline-none"
        />
      )}
    </div>
  );
}
