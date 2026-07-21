import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

type ResourceItem = {
  name: string;
  phone?: string;
  href?: string;
  tel?: string;
  note: string;
  states?: string[];
};

type CountryItem = {
  name: string;
  phone?: string;
  href?: string;
  tel?: string;
  note: string;
};

type Country = {
  code: string;
  name: string;
  items: CountryItem[];
};

const STATES = [

  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "Washington D.C."],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
];

const COUNTRIES: Country[] = [
  {
    code: "GB",
    name: "United Kingdom",

    items: [
      { name: "National Domestic Abuse Helpline (Refuge)", phone: "0808 2000 247", tel: "08082000247", note: "Free, confidential, 24/7. Run by Refuge." },
      { name: "Women's Aid", href: "https://www.womensaid.org.uk/", note: "Live chat, email support & local services directory." },
      { name: "Emergency", phone: "999", tel: "999", note: "Immediate danger. Silent option: press 55 when prompted." },
    ],
  },
  {
    code: "IE",
    name: "Ireland",
    items: [
      { name: "Women's Aid Ireland", phone: "1800 341 900", tel: "1800341900", note: "Free, confidential, 24/7 national freephone helpline." },
      { name: "Emergency", phone: "999 / 112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    items: [
      { name: "Assaulted Women's Helpline", phone: "1-866-863-0511", tel: "18668630511", note: "Free, anonymous, 24/7 (Ontario; refers across Canada)." },
      { name: "ShelterSafe", href: "https://sheltersafe.ca/", note: "Map of women's shelters across every Canadian province & territory." },
      { name: "Emergency", phone: "911", tel: "911", note: "Immediate danger." },
    ],
  },
  {
    code: "AU",
    name: "Australia",
    items: [
      { name: "1800RESPECT", phone: "1800 737 732", tel: "1800737732", note: "National domestic, family & sexual violence counselling. 24/7." },
      { name: "Emergency", phone: "000", tel: "000", note: "Immediate danger." },
    ],
  },
  {
    code: "NZ",
    name: "New Zealand",
    items: [
      { name: "Women's Refuge", phone: "0800 733 843", tel: "0800733843", note: "0800 REFUGE — free, confidential crisis line, 24/7." },
      { name: "Emergency", phone: "111", tel: "111", note: "Immediate danger." },
    ],
  },
  {
    code: "IN",
    name: "India",
    items: [
      { name: "Women Helpline", phone: "181", tel: "181", note: "National helpline for women in distress. 24/7." },
      { name: "National Commission for Women", phone: "7827-170-170", tel: "7827170170", note: "Report violence & get support, WhatsApp available." },
      { name: "Police Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "ZA",
    name: "South Africa",
    items: [
      { name: "GBV Command Centre", phone: "0800 428 428", tel: "0800428428", note: "Gender-based violence support, 24/7. Or dial *120*7867#." },
      { name: "Emergency", phone: "10111", tel: "10111", note: "Immediate danger." },
    ],
  },
  {
    code: "DE",
    name: "Germany",
    items: [
      { name: "Hilfetelefon Gewalt gegen Frauen", phone: "116 016", tel: "116016", note: "Free, 24/7, support in 18 languages." },
      { name: "Emergency", phone: "110", tel: "110", note: "Immediate danger." },
    ],
  },
  {
    code: "FR",
    name: "France",
    items: [
      { name: "Violences Femmes Info", phone: "3919", tel: "3919", note: "Free & anonymous national helpline for women." },
      { name: "Emergency", phone: "17 / 112", tel: "112", note: "Immediate danger. SMS to 114 if you cannot speak." },
    ],
  },
  {
    code: "ES",
    name: "Spain",
    items: [
      { name: "Línea 016", phone: "016", tel: "016", note: "Free, 24/7, leaves no trace on your phone bill." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "IT",
    name: "Italy",
    items: [
      { name: "Numero Anti Violenza e Stalking", phone: "1522", tel: "1522", note: "Free, 24/7, multilingual support for women." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "NL",
    name: "Netherlands",
    items: [
      { name: "Veilig Thuis", phone: "0800-2000", tel: "08002000", note: "Free advice & reporting centre for domestic violence. 24/7." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "IL",
    name: "Israel",
    items: [
      { name: "Ministry of Welfare Hotline", phone: "118", tel: "118", note: "National social services hotline — domestic violence support, 24/7." },
      { name: "Emergency", phone: "100", tel: "100", note: "Immediate danger (police)." },
    ],
  },
  {
    code: "MX",
    name: "Mexico",
    items: [
      { name: "Red Nacional de Refugios", phone: "800 822 4460", tel: "8008224460", note: "Safe shelters for women & children. Free & confidential." },
      { name: "Emergencia", phone: "911", tel: "911", note: "Immediate danger." },
    ],
  },
  {
    code: "BR",
    name: "Brazil",
    items: [
      { name: "Central de Atendimento à Mulher", phone: "180", tel: "180", note: "Ligue 180 — free national women's helpline, 24/7." },
      { name: "Emergência", phone: "190", tel: "190", note: "Immediate danger (police)." },
    ],
  },
];

const SECTIONS: { id: string; title: string; items: ResourceItem[] }[] = [
  {
    id: "crisis",
    title: "Crisis hotlines",
    items: [
      { name: "National Domestic Violence Hotline", phone: "1-800-799-SAFE (7233)", href: "tel:18007997233", note: "24/7 confidential support, safety planning, referrals." },
      { name: "National Sexual Assault Hotline (RAINN)", phone: "1-800-656-HOPE (4673)", href: "tel:18006564673", note: "24/7 confidential. Free, anonymous." },
      { name: "Childhelp National Child Abuse Hotline", phone: "1-800-422-4453", href: "tel:18004224453", note: "For children and adults." },
      { name: "Suicide & Crisis Lifeline", phone: "988", href: "tel:988", note: "Call or text 988, 24/7." },
      { name: "Emergency", phone: "911", href: "tel:911", note: "Immediate danger." },
    ],
  },
  {
    id: "text",
    title: "Text-based support (when you can't speak)",
    items: [
      { name: "Crisis Text Line", phone: "Text HOME to 741741", href: "sms:741741?body=HOME", note: "24/7 confidential crisis counseling by text." },
      { name: "Loveisrespect (dating abuse)", phone: "Text LOVEIS to 22522", href: "sms:22522?body=LOVEIS", note: "For teens and young adults." },
    ],
  },
  {
    id: "online",
    title: "Online support",
    items: [
      { name: "TheHotline.org", href: "https://www.thehotline.org/", note: "Anonymous online chat." },
      { name: "RAINN.org", href: "https://www.rainn.org/", note: "Online support, articles, resources." },
      { name: "Womenslaw.org", href: "https://www.womenslaw.org/", note: "Legal info for survivors of abuse." },
    ],
  },
  {
    id: "shelters",
    title: "Shelters & safe housing",
    items: [
      { name: "Rachel's Place (Brooklyn, NY)", states: ["NY"], href: "https://rachelsplace.org/", note: "Safe transitional home for girls & young women ages 16–21." },
      { name: "Garden of Hope (New York)", states: ["NY"], href: "https://www.gohny.org/contact", note: "Free, confidential DV services & safe houses." },
      { name: "The Dwelling Place (Minnesota)", states: ["MN"], href: "https://www.tdpmn.org/program", note: "Residential recovery program for women & children fleeing domestic abuse." },
      { name: "Hiding Place (Towson, MD)", states: ["MD"], href: "https://hidingplacemd.com/", note: "Christian residential home for young women facing crisis." },
      { name: "Refuge for Women", href: "https://refugeforwomen.org/about-us/", note: "National faith-based safe housing & aftercare." },
      { name: "Samaritan House (Virginia Beach, VA)", states: ["VA"], href: "https://samaritanhouseva.org/", note: "Safe housing & support for survivors of domestic violence and trafficking." },
      { name: "The Salvation Army", href: "https://www.salvationarmyusa.org/homelessness/violence/domestic-violence/", note: "Domestic violence shelters and support services nationwide." },
    ],
  },
  {
    id: "community",
    title: "Community & faith-based support",
    items: [
      { name: "Sanctuary for Families (NY)", states: ["NY"], href: "https://sanctuaryforfamilies.org/", note: "Service provider for survivors of domestic violence and gender-based violence." },
      { name: "OHEL Family Services", states: ["NY", "NJ"], href: "https://www.ohelfamily.org/domestic-violence/", note: "Domestic violence support within the Jewish community." },
      { name: "Shalva", states: ["IL"], href: "https://shalvacares.org/", note: "Support for abuse survivors in the Orthodox Jewish community." },
      { name: "DomesticShelters.org — Hasidic community", href: "https://www.domesticshelters.org/articles/identifying-abuse/helping-hasidic-jews-escape-domestic-violence", note: "Helping Hasidic Jews escape domestic violence." },
      { name: "Asiyah Women's Center", states: ["NY"], href: "https://www.asiyahwomenscenter.org/", note: "Emergency shelter & culturally sensitive support for Muslim women and children." },
      { name: "Amanah House (MAS-SSF)", states: ["CA"], href: "https://mas-ssf.org/amanah-house/", note: "Faith-sensitive transitional home and support for women in crisis." },
      { name: "Jewish Board of Family & Children's Services", states: ["NY"], href: "https://www.findhelp.org/provider/jewish-board-of-family-and-childrens-services-(jbfcs)--new-york-ny/6321792781910016", note: "Counseling, mental health, and family support services in New York." },
    ],
  },
  {
    id: "directories",
    title: "Directories & digital safety",
    items: [
      { name: "NYSCADV Program Directory", states: ["NY"], href: "https://www.nyscadv.org/find-help/program-directory.html", note: "Find a domestic violence program near you." },
      { name: "NYSCADV Digital Safety", href: "https://www.nyscadv.org/find-help/digital-safety.html", note: "Keep your phone, computer, and accounts safe from monitoring." },
    ],
  },
];

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — MrsAnonymous" },
      { name: "description", content: "Crisis hotlines, shelters, text support, and safety resources for women and girls." },
      { property: "og:title", content: "Resources — MrsAnonymous" },
      { property: "og:description", content: "Crisis hotlines, shelters, text support, and safety resources." },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  return (
    <div className="paper-bg">
      <div className="mx-auto max-w-4xl px-5 py-16 lg:px-10">
        <span className="hand-note text-2xl">help is real</span>
        <h1 className="mt-2 font-serif text-5xl text-ink-900">Resources</h1>
        <p className="mt-4 max-w-2xl text-ink-500">
          These are the same hotlines and organizations professionals refer to. They are free, confidential, and
          available right now.
        </p>

        <LocationFinder />

        {SECTIONS.map((s) => (
          <section key={s.id} data-testid={`resource-${s.id}`} className="mt-10">
            <h2 className="font-serif text-2xl text-ink-900">{s.title}</h2>
            <ul className="mt-4 space-y-4">
              {s.items.map((it) => (
                <li key={it.name} className="note-card flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-ink-900">{it.name}</div>
                    <div className="text-sm text-ink-500">{it.note}</div>
                  </div>
                  <a
                    data-testid={`resource-link-${slug(it.name)}`}
                    href={it.href}
                    target={it.href?.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="btn-rose !px-4 !py-2 !text-xs"
                  >
                    {it.phone || "Visit"}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function LocationFinder() {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const stateName = state ? STATES.find(([c]) => c === state)?.[1] : "";
  const local = state ? SECTIONS.flatMap((s) => s.items).filter((it) => it.states?.includes(state)) : [];
  const intl = country && country !== "US" ? COUNTRIES.find((c) => c.code === country) : null;

  return (
    <section data-testid="resource-location-finder" className="mt-10 rounded-2xl border-2 border-ink-900 bg-white p-6 shadow-[4px_4px_0_#0A0A0A]">
      <h2 className="font-serif text-2xl text-ink-900">Find services in your area</h2>
      <p className="mt-1 text-sm text-ink-500">
        Pick your country to see help near you. We never detect or store your location — you choose.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <select
          data-testid="country-select"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setState("");
          }}
          className="w-full max-w-sm rounded-xl border border-ink-300/60 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-rose-500"
        >
          <option value="">Choose your country…</option>
          <option value="US">United States</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
          <option value="OTHER">Another country</option>
        </select>

        {country === "US" && (
          <select
            data-testid="location-select"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full max-w-sm rounded-xl border border-ink-300/60 bg-white px-4 py-3 text-sm text-ink-900 outline-none focus:border-rose-500"
          >
            <option value="">Choose your state…</option>
            {STATES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {country === "US" && state && (
        <div data-testid="location-results" className="mt-6">
          {local.length > 0 ? (
            <>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Services we know in {stateName}</div>
              <ul className="mt-3 space-y-3">
                {local.map((it) => (
                  <li key={it.name} className="note-card flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-semibold text-ink-900">{it.name}</div>
                      <div className="text-sm text-ink-500">{it.note}</div>
                    </div>
                    <a
                      data-testid={`location-link-${slug(it.name)}`}
                      href={it.href}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-rose shrink-0 !px-4 !py-2 !text-xs"
                    >
                      Visit
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p data-testid="location-empty" className="text-sm text-ink-500">
              We don&apos;t have a hand-picked listing for {stateName} yet — but the directory below covers every shelter and
              program in your state, and every national hotline on this page works wherever you are.
            </p>
          )}

          <a
            data-testid="location-directory-link"
            href={`https://www.domesticshelters.org/help/${state.toLowerCase()}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost mt-4 inline-flex !px-5 !py-2.5 !text-xs"
          >
            Browse all domestic violence programs in {stateName} →
          </a>
        </div>
      )}

      {intl && (
        <div data-testid="intl-results" className="mt-6">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Help in {intl.name}</div>
          <ul className="mt-3 space-y-3">
            {intl.items.map((it) => (
              <li key={it.name} className="note-card flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-ink-900">{it.name}</div>
                  <div className="text-sm text-ink-500">{it.note}</div>
                </div>
                {it.tel ? (
                  <a data-testid={`intl-link-${slug(it.name)}`} href={`tel:${it.tel}`} className="btn-rose shrink-0 !px-4 !py-2 !text-xs">
                    {it.phone}
                  </a>
                ) : (
                  <a
                    data-testid={`intl-link-${slug(it.name)}`}
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-rose shrink-0 !px-4 !py-2 !text-xs"
                  >
                    Visit
                  </a>
                )}
              </li>
            ))}
          </ul>
          <a
            data-testid="intl-directory-link"
            href="https://nomoredirectory.org/"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost mt-4 inline-flex !px-5 !py-2.5 !text-xs"
          >
            More services in {intl.name} — NO MORE Global Directory →
          </a>
        </div>
      )}

      {country === "OTHER" && (
        <div data-testid="intl-other" className="mt-6">
          <p className="text-sm text-ink-500">
            Wherever you are, help exists. The NO MORE Global Directory lists domestic & sexual violence helplines in over
            200 countries and territories — checked and updated regularly.
          </p>
          <a
            data-testid="intl-other-directory-link"
            href="https://nomoredirectory.org/"
            target="_blank"
            rel="noreferrer"
            className="btn-rose mt-4 inline-flex !px-5 !py-2.5 !text-xs"
          >
            Find a helpline in your country →
          </a>
        </div>
      )}
    </section>
  );
}
