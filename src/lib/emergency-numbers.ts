import type { LangCode } from "@/lib/translations";

export type EmergencyProfile = {
  country: string;
  police: string;        // number dialed (tel:)
  policeLabel: string;   // display label
  medical?: string;      // ambulance / medical
  medicalLabel?: string;
  fire?: string;         // fire service
  fireLabel?: string;
  crisis?: string;       // suicide / mental health crisis line
  crisisLabel?: string;
  sms?: string;          // number for text-to-emergency, if supported
  smsSupported: boolean; // hide text button if false
};

// Language-to-default-country emergency mapping. Meant as a sensible default
// for the language's most common speaker base; users can still call any
// number from the Resources page.
const PROFILES: Record<string, EmergencyProfile> = {
  en: { country: "US",    police: "911",  policeLabel: "911",         crisis: "988",     crisisLabel: "988",     sms: "911",  smsSupported: true },
  es: { country: "ES",    police: "112",  policeLabel: "112",         crisis: "024",     crisisLabel: "024",                     smsSupported: false },
  fr: { country: "FR",    police: "112",  policeLabel: "112",         crisis: "3114",    crisisLabel: "3114",                    smsSupported: false },
  de: { country: "DE",    police: "112",  policeLabel: "112 / 110",   crisis: "0800 111 0 111", crisisLabel: "0800 111 0 111",   smsSupported: false },
  it: { country: "IT",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  pt: { country: "PT",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  nl: { country: "NL",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  pl: { country: "PL",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  ru: { country: "RU",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  uk: { country: "UA",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  tr: { country: "TR",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  he: {
    country: "IL",
    police: "100", policeLabel: "100 (משטרה)",
    medical: "101", medicalLabel: "101 (מד\"א)",
    fire: "102",    fireLabel: "102 (כיבוי אש)",
    crisis: "1201", crisisLabel: "1201 (ער\"ן)",
    sms: "0522020100", // Israel Police SMS line 052-2020100
    smsSupported: true,
  },
  ar: { country: "INT",   police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  fa: { country: "IR",    police: "110",  policeLabel: "110",                                                                     smsSupported: false },
  ur: { country: "PK",    police: "15",   policeLabel: "15",                                                                      smsSupported: false },
  hi: { country: "IN",    police: "112",  policeLabel: "112",         crisis: "9152987821", crisisLabel: "iCall 9152987821",      smsSupported: false },
  bn: { country: "BD",    police: "999",  policeLabel: "999",                                                                     smsSupported: false },
  zh: { country: "CN",    police: "110",  policeLabel: "110", medical: "120", medicalLabel: "120", fire: "119", fireLabel: "119", smsSupported: false },
  ja: { country: "JP",    police: "110",  policeLabel: "110", medical: "119", medicalLabel: "119", fire: "119", fireLabel: "119", smsSupported: false },
  ko: { country: "KR",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  vi: { country: "VN",    police: "113",  policeLabel: "113",                                                                     smsSupported: false },
  tl: { country: "PH",    police: "911",  policeLabel: "911",                                                                     smsSupported: false },
  id: { country: "ID",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
  sw: { country: "KE",    police: "112",  policeLabel: "112",                                                                     smsSupported: false },
};

// Country-specific emergency profiles. A user's chosen country always wins
// over the language-based default above.
const COUNTRY_PROFILES: Record<string, EmergencyProfile> = {
  US: { country: "US", police: "911", policeLabel: "911", medical: "911", medicalLabel: "911", fire: "911", fireLabel: "911", crisis: "988", crisisLabel: "988", sms: "911", smsSupported: true },
  CA: { country: "CA", police: "911", policeLabel: "911", medical: "911", medicalLabel: "911", crisis: "988", crisisLabel: "988", sms: "911", smsSupported: true },
  GB: { country: "GB", police: "999", policeLabel: "999 / 112", medical: "999", medicalLabel: "999", crisis: "116123", crisisLabel: "116 123 (Samaritans)", sms: "999", smsSupported: true },
  IE: { country: "IE", police: "112", policeLabel: "112 / 999", crisis: "116123", crisisLabel: "116 123", smsSupported: false },
  AU: { country: "AU", police: "000", policeLabel: "000", crisis: "131114", crisisLabel: "13 11 14 (Lifeline)", sms: "106", smsSupported: true },
  NZ: { country: "NZ", police: "111", policeLabel: "111", crisis: "1737", crisisLabel: "1737", sms: "111", smsSupported: true },
  IL: PROFILES.he,
  IN: { country: "IN", police: "112", policeLabel: "112", crisis: "9152987821", crisisLabel: "iCall 9152987821", smsSupported: false },
  PK: { country: "PK", police: "15", policeLabel: "15", smsSupported: false },
  BD: { country: "BD", police: "999", policeLabel: "999", smsSupported: false },
  PH: { country: "PH", police: "911", policeLabel: "911", smsSupported: false },
  ID: { country: "ID", police: "112", policeLabel: "112", smsSupported: false },
  JP: { country: "JP", police: "110", policeLabel: "110", medical: "119", medicalLabel: "119", fire: "119", fireLabel: "119", smsSupported: false },
  KR: { country: "KR", police: "112", policeLabel: "112", smsSupported: false },
  CN: { country: "CN", police: "110", policeLabel: "110", medical: "120", medicalLabel: "120", fire: "119", fireLabel: "119", smsSupported: false },
  VN: { country: "VN", police: "113", policeLabel: "113", smsSupported: false },
  RU: { country: "RU", police: "112", policeLabel: "112", smsSupported: false },
  UA: { country: "UA", police: "112", policeLabel: "112", smsSupported: false },
  TR: { country: "TR", police: "112", policeLabel: "112", smsSupported: false },
  IR: { country: "IR", police: "110", policeLabel: "110", smsSupported: false },
  ZA: { country: "ZA", police: "10111", policeLabel: "10111", medical: "10177", medicalLabel: "10177", smsSupported: false },
  NG: { country: "NG", police: "112", policeLabel: "112", smsSupported: false },
  KE: { country: "KE", police: "112", policeLabel: "112", smsSupported: false },
  EG: { country: "EG", police: "122", policeLabel: "122", smsSupported: false },
  MX: { country: "MX", police: "911", policeLabel: "911", smsSupported: false },
  BR: { country: "BR", police: "190", policeLabel: "190", medical: "192", medicalLabel: "192", crisis: "188", crisisLabel: "188 (CVV)", smsSupported: false },
  AR: { country: "AR", police: "911", policeLabel: "911", smsSupported: false },
  ES: { country: "ES", police: "112", policeLabel: "112", crisis: "024", crisisLabel: "024", smsSupported: false },
  FR: { country: "FR", police: "112", policeLabel: "112 / 17", crisis: "3114", crisisLabel: "3114", sms: "114", smsSupported: true },
  DE: { country: "DE", police: "110", policeLabel: "110 / 112", crisis: "0800 111 0 111", crisisLabel: "0800 111 0 111", smsSupported: false },
  IT: { country: "IT", police: "112", policeLabel: "112", smsSupported: false },
  PT: { country: "PT", police: "112", policeLabel: "112", smsSupported: false },
  NL: { country: "NL", police: "112", policeLabel: "112", smsSupported: false },
  BE: { country: "BE", police: "112", policeLabel: "112", smsSupported: false },
  PL: { country: "PL", police: "112", policeLabel: "112", smsSupported: false },
  SE: { country: "SE", police: "112", policeLabel: "112", smsSupported: false },
  NO: { country: "NO", police: "112", policeLabel: "112", smsSupported: false },
  DK: { country: "DK", police: "112", policeLabel: "112", smsSupported: false },
  FI: { country: "FI", police: "112", policeLabel: "112", smsSupported: false },
  CH: { country: "CH", police: "117", policeLabel: "117 / 112", smsSupported: false },
  AT: { country: "AT", police: "133", policeLabel: "133 / 112", smsSupported: false },
  AE: { country: "AE", police: "999", policeLabel: "999", smsSupported: false },
  SA: { country: "SA", police: "999", policeLabel: "999", smsSupported: false },
  INT: { country: "INT", police: "112", policeLabel: "112", smsSupported: false },
};

export type CountryOption = { code: string; name: string };

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "IL", name: "Israel" },
  { code: "IN", name: "India" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "PH", name: "Philippines" },
  { code: "ID", name: "Indonesia" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "VN", name: "Vietnam" },
  { code: "RU", name: "Russia" },
  { code: "UA", name: "Ukraine" },
  { code: "TR", name: "Türkiye" },
  { code: "IR", name: "Iran" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "EG", name: "Egypt" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "PL", name: "Poland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "INT", name: "Somewhere else / prefer not to say" },
];

export function countryName(code?: string | null) {
  return COUNTRY_OPTIONS.find((c) => c.code === code)?.name ?? "";
}

/** Best-effort guess of the visitor's country from the browser locale. */
export function detectCountry(): string {
  if (typeof navigator === "undefined") return "US";
  const langs = [navigator.language, ...(navigator.languages ?? [])];
  for (const l of langs) {
    const region = l?.split("-")[1]?.toUpperCase();
    if (region && COUNTRY_PROFILES[region]) return region;
  }
  return "US";
}

export function getEmergency(lang: LangCode, country?: string | null): EmergencyProfile {
  if (country && COUNTRY_PROFILES[country]) return COUNTRY_PROFILES[country];
  return PROFILES[lang] ?? PROFILES.en;
}