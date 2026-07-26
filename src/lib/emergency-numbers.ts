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

export function getEmergency(lang: LangCode): EmergencyProfile {
  return PROFILES[lang] ?? PROFILES.en;
}