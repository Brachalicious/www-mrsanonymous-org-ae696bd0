import { createFileRoute } from "@tanstack/react-router";
import { useState, type MouseEvent } from "react";
import { isHideHistoryEnabled } from "@/components/PrivacyBanner";

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
  sms?: string;   // display SMS number
  smsTel?: string; // digits-only for sms: link
  fax?: string;
  email?: string;
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
      { name: "Rape Crisis England & Wales", phone: "0808 500 2222", tel: "08085002222", note: "24/7 support line for anyone affected by sexual violence." },
      { name: "The Survivors Trust", phone: "08088 010 818", tel: "08088010818", note: "National helpline for survivors of rape & sexual abuse." },
      { name: "NSPCC (child abuse)", phone: "0808 800 5000", tel: "08088005000", note: "Report concerns about a child. 24/7." },
      { name: "Childline (under 19)", phone: "0800 1111", tel: "08001111", note: "Free, confidential, 24/7 for children & young people." },
      { name: "Karma Nirvana (honour-based abuse & forced marriage)", phone: "0800 5999 247", tel: "08005999247", note: "Support for victims of honour-based abuse." },
      { name: "Galop (LGBT+ anti-abuse)", phone: "0800 999 5428", tel: "08009995428", note: "LGBT+ domestic abuse helpline." },
      { name: "Men's Advice Line", phone: "0808 8010 327", tel: "08088010327", note: "For male victims of domestic abuse." },
      { name: "Samaritans (suicide/crisis)", phone: "116 123", tel: "116123", note: "Free, 24/7, listening support." },
      { name: "Shelter (housing)", phone: "0808 800 4444", tel: "08088004444", note: "Emergency housing advice." },
      { name: "Rights of Women (legal)", href: "https://rightsofwomen.org.uk/get-advice/", note: "Free confidential legal advice lines." },
      { name: "Emergency", phone: "999", tel: "999", note: "Immediate danger. Silent option: press 55 when prompted." },
    ],
  },
  {
    code: "IE",
    name: "Ireland",
    items: [
      { name: "Women's Aid Ireland", phone: "1800 341 900", tel: "1800341900", note: "Free, confidential, 24/7 national freephone helpline." },
      { name: "Dublin Rape Crisis Centre", phone: "1800 77 8888", tel: "1800778888", note: "24/7 national helpline for sexual violence." },
      { name: "Safe Ireland", href: "https://www.safeireland.ie/get-help/", note: "Directory of DV services & refuges nationwide." },
      { name: "Male Advice Line (Men's Aid)", phone: "01 554 3811", tel: "015543811", note: "Confidential support for male victims." },
      { name: "ISPCC Childline", phone: "1800 66 66 66", tel: "1800666666", note: "24/7 support for children & young people." },
      { name: "Samaritans Ireland", phone: "116 123", tel: "116123", note: "24/7 emotional support." },
      { name: "Pieta House (suicide/self-harm)", phone: "1800 247 247", tel: "1800247247", note: "24/7 free crisis support." },
      { name: "LGBT Ireland Helpline", phone: "1800 929 539", tel: "1800929539", note: "Support for LGBTQ+ community & families." },
      { name: "Emergency", phone: "999 / 112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    items: [
      { name: "Assaulted Women's Helpline", phone: "1-866-863-0511", tel: "18668630511", note: "Free, anonymous, 24/7 (Ontario; refers across Canada)." },
      { name: "ShelterSafe", href: "https://sheltersafe.ca/", note: "Map of women's shelters across every Canadian province & territory." },
      { name: "Ending Violence Association of Canada", href: "https://endingviolencecanada.org/getting-help/", note: "National directory of sexual & domestic violence services." },
      { name: "Talk4Healing (Indigenous women)", phone: "1-855-554-4325", tel: "18555544325", note: "24/7 helpline for Indigenous women in 14 languages." },
      { name: "Kids Help Phone", phone: "1-800-668-6868", tel: "18006686868", note: "24/7 support for children & youth. Text CONNECT to 686868." },
      { name: "Talk Suicide Canada", phone: "1-833-456-4566", tel: "18334564566", note: "24/7 suicide prevention. Text 45645 (4pm–midnight ET)." },
      { name: "Hope for Wellness (Indigenous)", phone: "1-855-242-3310", tel: "18552423310", note: "24/7 counselling for Indigenous Peoples." },
      { name: "Trans Lifeline", phone: "1-877-330-6366", tel: "18773306366", note: "Peer support for trans people in crisis." },
      { name: "Emergency", phone: "911", tel: "911", note: "Immediate danger." },
    ],
  },
  {
    code: "AU",
    name: "Australia",
    items: [
      { name: "1800RESPECT", phone: "1800 737 732", tel: "1800737732", note: "National domestic, family & sexual violence counselling. 24/7." },
      { name: "DV Connect Womensline", phone: "1800 811 811", tel: "1800811811", note: "24/7 crisis support & refuge referral." },
      { name: "Full Stop Australia", phone: "1800 385 578", tel: "1800385578", note: "24/7 counselling for sexual, domestic & family violence." },
      { name: "MensLine Australia", phone: "1300 78 99 78", tel: "1300789978", note: "24/7 support for men." },
      { name: "Kids Helpline (5–25)", phone: "1800 55 1800", tel: "1800551800", note: "Free, 24/7, confidential counselling." },
      { name: "Lifeline (suicide/crisis)", phone: "13 11 14", tel: "131114", note: "24/7 crisis support. Text 0477 13 11 14." },
      { name: "QLife (LGBTIQ+)", phone: "1800 184 527", tel: "1800184527", note: "Peer support 3pm–midnight daily." },
      { name: "13YARN (Aboriginal & Torres Strait Islander)", phone: "13 92 76", tel: "139276", note: "24/7 crisis support line." },
      { name: "Emergency", phone: "000", tel: "000", note: "Immediate danger." },
    ],
  },
  {
    code: "NZ",
    name: "New Zealand",
    items: [
      { name: "Women's Refuge", phone: "0800 733 843", tel: "0800733843", note: "0800 REFUGE — free, confidential crisis line, 24/7." },
      { name: "Shine (family violence)", phone: "0508 744 633", tel: "0508744633", note: "9am–11pm, 7 days." },
      { name: "Safe to Talk (sexual harm)", phone: "0800 044 334", tel: "0800044334", note: "24/7. Text 4334." },
      { name: "Oranga Tamariki (child safety)", phone: "0508 326 459", tel: "0508326459", note: "Report concerns about a child. 24/7." },
      { name: "Youthline", phone: "0800 376 633", tel: "0800376633", note: "24/7. Free text 234." },
      { name: "Lifeline Aotearoa", phone: "0800 543 354", tel: "0800543354", note: "24/7 crisis & suicide prevention." },
      { name: "OUTLine (LGBTQIA+)", phone: "0800 688 5463", tel: "0800688546", note: "Rainbow support line, 6pm–9pm daily." },
      { name: "Emergency", phone: "111", tel: "111", note: "Immediate danger." },
    ],
  },
  {
    code: "IN",
    name: "India",
    items: [
      { name: "Women Helpline", phone: "181", tel: "181", note: "National helpline for women in distress. 24/7." },
      { name: "National Commission for Women", phone: "7827-170-170", tel: "7827170170", note: "Report violence & get support, WhatsApp available." },
      { name: "SNEHA (Mumbai)", phone: "+91-98330-52684", tel: "919833052684", note: "24/7 domestic violence crisis support." },
      { name: "Shakti Shalini", phone: "011-24373737", tel: "01124373737", note: "Delhi-based DV crisis intervention." },
      { name: "Childline India", phone: "1098", tel: "1098", note: "24/7 emergency helpline for children." },
      { name: "iCall (mental health)", phone: "9152987821", tel: "9152987821", note: "Mon–Sat, 8am–10pm. Free counselling." },
      { name: "AASRA (suicide)", phone: "9820466726", tel: "9820466726", note: "24/7 crisis line." },
      { name: "Vandrevala Foundation", phone: "1860-2662-345", tel: "18602662345", note: "24/7 mental health helpline." },
      { name: "Police Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "ZA",
    name: "South Africa",
    items: [
      { name: "GBV Command Centre", phone: "0800 428 428", tel: "0800428428", note: "Gender-based violence support, 24/7. Or dial *120*7867#." },
      { name: "People Opposing Women Abuse (POWA)", phone: "011 642 4345", tel: "0116424345", note: "Counselling & legal support." },
      { name: "Lifeline SA", phone: "0861 322 322", tel: "0861322322", note: "24/7 counselling & crisis line." },
      { name: "TEARS Foundation (rape/DV)", phone: "*134*7355#", note: "Free USSD to find nearest help." },
      { name: "Childline SA", phone: "116", tel: "116", note: "24/7 free crisis line for children." },
      { name: "SADAG (mental health/suicide)", phone: "0800 567 567", tel: "0800567567", note: "24/7 suicide crisis line." },
      { name: "Emergency", phone: "10111", tel: "10111", note: "Immediate danger." },
    ],
  },
  {
    code: "DE",
    name: "Germany",
    items: [
      { name: "Hilfetelefon Gewalt gegen Frauen", phone: "116 016", tel: "116016", note: "Free, 24/7, support in 18 languages." },
      { name: "Frauenhauskoordinierung (shelter finder)", href: "https://www.frauenhauskoordinierung.de/frauenhaussuche", note: "Find a women's shelter near you." },
      { name: "Hilfetelefon Sexueller Missbrauch", phone: "0800 22 55 530", tel: "0800225530", note: "Support for survivors of sexual abuse." },
      { name: "Nummer gegen Kummer (children)", phone: "116 111", tel: "116111", note: "Free helpline for children & teens." },
      { name: "Telefonseelsorge (crisis/suicide)", phone: "0800 111 0 111", tel: "08001110111", note: "24/7 free crisis line." },
      { name: "LSVD (LGBTQ+)", href: "https://www.lsvd.de/de/beratung", note: "Directory of LGBTQ+ counselling services." },
      { name: "Emergency", phone: "110", tel: "110", note: "Immediate danger." },
    ],
  },
  {
    code: "FR",
    name: "France",
    items: [
      { name: "Violences Femmes Info", phone: "3919", tel: "3919", note: "Free & anonymous national helpline for women." },
      { name: "Viols Femmes Informations", phone: "0800 05 95 95", tel: "0800059595", note: "Free anonymous line for rape survivors." },
      { name: "Solidarité Femmes shelters", href: "https://www.solidaritefemmes.org/", note: "Federation of women's shelters across France." },
      { name: "Allô Enfance en Danger", phone: "119", tel: "119", note: "24/7 child protection line." },
      { name: "Suicide Écoute", phone: "01 45 39 40 00", tel: "0145394000", note: "24/7 suicide prevention." },
      { name: "SOS Amitié", phone: "09 72 39 40 50", tel: "0972394050", note: "24/7 emotional support." },
      { name: "SOS Homophobie", phone: "01 48 06 42 41", tel: "0148064241", note: "LGBTQ+ discrimination & violence support." },
      { name: "Emergency", phone: "17 / 112", tel: "112", note: "Immediate danger. SMS to 114 if you cannot speak." },
    ],
  },
  {
    code: "ES",
    name: "Spain",
    items: [
      { name: "Línea 016", phone: "016", tel: "016", note: "Free, 24/7, leaves no trace on your phone bill." },
      { name: "ANAR (children & teens)", phone: "900 20 20 10", tel: "900202010", note: "24/7 free child helpline." },
      { name: "Teléfono de la Esperanza", phone: "717 003 717", tel: "717003717", note: "24/7 emotional & suicide crisis support." },
      { name: "Fundación Ana Bella (survivors network)", href: "https://www.fundacionanabella.org/", note: "Peer support for women survivors of abuse." },
      { name: "FELGTBI+ (LGBTQ+)", href: "https://felgtbi.org/", note: "National LGBTQ+ support & advocacy." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "IT",
    name: "Italy",
    items: [
      { name: "Numero Anti Violenza e Stalking", phone: "1522", tel: "1522", note: "Free, 24/7, multilingual support for women." },
      { name: "D.i.Re (shelter network)", href: "https://www.direcontrolaviolenza.it/", note: "Directory of anti-violence centres & shelters." },
      { name: "Telefono Azzurro (children)", phone: "19696", tel: "19696", note: "24/7 free child helpline." },
      { name: "Telefono Amico (crisis)", phone: "02 2327 2327", tel: "0223272327", note: "Emotional support line, 10am–midnight." },
      { name: "Gay Help Line", phone: "800 713 713", tel: "800713713", note: "LGBTQ+ support, daily 1pm–10pm." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "NL",
    name: "Netherlands",
    items: [
      { name: "Veilig Thuis", phone: "0800-2000", tel: "08002000", note: "Free advice & reporting centre for domestic violence. 24/7." },
      { name: "Centrum Seksueel Geweld", phone: "0800-0188", tel: "08000188", note: "24/7 support after sexual violence." },
      { name: "Blijf Groep (shelters)", href: "https://www.blijfgroep.nl/", note: "Women's shelters & safe housing." },
      { name: "De Kindertelefoon", phone: "0800-0432", tel: "08000432", note: "Free helpline for children 8–18." },
      { name: "113 Zelfmoordpreventie", phone: "113", tel: "113", note: "24/7 suicide prevention. Also 0800-0113." },
      { name: "Switchboard (LGBTQ+)", phone: "020 623 6565", tel: "0206236565", note: "LGBTQ+ helpline." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "IL",
    name: "Israel",
    items: [
      { name: "Israel Police (משטרת ישראל)", phone: "100", tel: "100", note: "Immediate danger — national police emergency line.", sms: "052-2020100", smsTel: "0522020100", fax: "08-6525111", email: "listen@police.gov.il" },
      { name: "Magen David Adom (מגן דוד אדום)", phone: "101", tel: "101", note: "National emergency medical, ambulance, disaster & blood bank service.", sms: "052-7000101", smsTel: "0527000101", fax: "1-800-500-101", email: "101@mda.org.il" },
      { name: "Israel Fire and Rescue Services (כבאות והצלה)", phone: "102", tel: "102", note: "National fire & rescue emergency line.", sms: "050-5960735", smsTel: "0505960735", fax: "03-9532230" },
      { name: "Home Front Command (פיקוד העורף)", phone: "104", tel: "104", note: "Civil defense — rocket alerts, shelter guidance, wartime emergencies.", sms: "052-9415520", smsTel: "0529415520", fax: "08-9783603" },
      { name: "Israel Electric Corporation (חברת חשמל)", phone: "103", tel: "103", note: "Power outages, downed lines, electrical emergencies.", sms: "050-5960735", smsTel: "0505960735", fax: "1-800-200-103" },
      { name: "Israel Police Information Center", phone: "110", tel: "110", note: "Non-emergency police information & complaints center.", fax: "02-5898823", email: "tlunot@police.gov.il" },
      { name: "Ministry of Welfare Hotline", phone: "118", tel: "118", note: "National social services hotline — domestic violence support, 24/7." },
      { name: "L.A. Women — 1202 (Hebrew) / 1203 (Arabic)", phone: "1202", tel: "1202", note: "24/7 rape crisis hotline. Arabic: 1203." },
      { name: "WIZO Domestic Violence Hotline", phone: "1-800-220-000", tel: "1800220000", note: "Free, confidential 24/7." },
      { name: "No2Violence (Bat Melech, religious women)", phone: "1-800-292-333", tel: "1800292333", note: "Shelter & support for religious women." },
      { name: "ERAN (emotional first aid)", phone: "1201", tel: "1201", note: "24/7 crisis & suicide prevention." },
      { name: "ELEM (at-risk youth)", href: "https://www.elem.org.il/en/", note: "Support & outreach for youth in crisis." },
      { name: "IGY (LGBTQ+ youth)", href: "https://igy.org.il/en/", note: "LGBTQ+ youth support." },
    ],
  },
  {
    code: "MX",
    name: "Mexico",
    items: [
      { name: "Red Nacional de Refugios", phone: "800 822 4460", tel: "8008224460", note: "Safe shelters for women & children. Free & confidential." },
      { name: "Línea Mujeres (CDMX Locatel)", phone: "800 108 4053", tel: "8001084053", note: "24/7 legal, psychological & medical support." },
      { name: "SAPTEL (crisis/suicide)", phone: "55 5259-8121", tel: "5552598121", note: "24/7 free psychological crisis line." },
      { name: "Fundación en Pantalla contra la Violencia", href: "https://www.gob.mx/conavim", note: "CONAVIM directory of women's justice centres." },
      { name: "Yaaj México (LGBTQ+)", href: "https://yaajmexico.org/", note: "LGBTQ+ family & mental health support." },
      { name: "Emergencia", phone: "911", tel: "911", note: "Immediate danger." },
    ],
  },
  {
    code: "BR",
    name: "Brazil",
    items: [
      { name: "Central de Atendimento à Mulher", phone: "180", tel: "180", note: "Ligue 180 — free national women's helpline, 24/7." },
      { name: "Disque 100 (human rights & children)", phone: "100", tel: "100", note: "Report violence against children & vulnerable people." },
      { name: "CVV (suicide prevention)", phone: "188", tel: "188", note: "24/7 free emotional support." },
      { name: "Casa da Mulher Brasileira", href: "https://www.gov.br/mdh/pt-br", note: "Integrated women's justice & shelter centres across states." },
      { name: "Instituto Maria da Penha", href: "https://www.institutomariadapenha.org.br/", note: "Legal information & support for DV survivors." },
      { name: "ANTRA (trans support)", href: "https://antrabrasil.org/", note: "National trans network & support." },
      { name: "Emergência", phone: "190", tel: "190", note: "Immediate danger (police)." },
    ],
  },
  {
    code: "PH",
    name: "Philippines",
    items: [
      { name: "PNP Women & Children Protection Center", phone: "(02) 8532-6690", tel: "0285326690", note: "24/7 police unit for VAWC cases." },
      { name: "DSWD Crisis Intervention", phone: "1343", tel: "1343", note: "Anti-trafficking & crisis support (Metro Manila)." },
      { name: "Women's Crisis Center", href: "https://www.wccphils.org/", note: "Counselling, legal & medical support." },
      { name: "In Touch Crisis Line", phone: "(02) 8893-7603", tel: "0288937603", note: "24/7 emotional & suicide crisis support." },
      { name: "Emergency", phone: "911", tel: "911", note: "Immediate danger." },
    ],
  },
  {
    code: "SG",
    name: "Singapore",
    items: [
      { name: "AWARE Women's Helpline", phone: "1800 777 5555", tel: "18007775555", note: "Mon–Fri, 10am–6pm. Confidential support." },
      { name: "PAVe (family violence)", phone: "6555 0390", tel: "65550390", note: "Counselling for family violence." },
      { name: "SOS (crisis/suicide)", phone: "1767", tel: "1767", note: "24/7 crisis line. Text 9151 1767." },
      { name: "Tinkle Friend (children)", phone: "1800 274 4788", tel: "18002744788", note: "Helpline for primary-school children." },
      { name: "Oogachaga (LGBTQ+)", phone: "6226 2002", tel: "62262002", note: "Counselling & support." },
      { name: "Emergency", phone: "999", tel: "999", note: "Immediate danger." },
    ],
  },
  {
    code: "JP",
    name: "Japan",
    items: [
      { name: "DV Consultation Navi", phone: "#8008", tel: "8008", note: "Connects to nearest DV support centre." },
      { name: "Yorisoi Hotline", phone: "0120-279-338", tel: "0120279338", note: "24/7 free multilingual support." },
      { name: "TELL Lifeline (English)", phone: "03-5774-0992", tel: "0357740992", note: "English-language crisis support, daily." },
      { name: "Childline Japan", phone: "0120-99-7777", tel: "0120997777", note: "Free helpline for under-18s." },
      { name: "Inochi no Denwa (suicide)", phone: "0570-783-556", tel: "0570783556", note: "Daily suicide prevention line." },
      { name: "Emergency", phone: "110", tel: "110", note: "Immediate danger (police). Fire/ambulance: 119." },
    ],
  },
  {
    code: "KR",
    name: "South Korea",
    items: [
      { name: "Women's Emergency Hotline", phone: "1366", tel: "1366", note: "24/7 free crisis line for women (DV, sexual assault, trafficking)." },
      { name: "Korea Sexual Violence Relief Center", href: "https://ksvrc.org/", note: "Counselling & legal aid." },
      { name: "Danuri (migrant women)", phone: "1577-1366", tel: "15771366", note: "24/7 multilingual support for migrant women." },
      { name: "Child Protection Hotline", phone: "112", tel: "112", note: "Report child abuse (also police)." },
      { name: "Suicide Prevention Hotline", phone: "1393", tel: "1393", note: "24/7 crisis line." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "AR",
    name: "Argentina",
    items: [
      { name: "Línea 144 (violencia de género)", phone: "144", tel: "144", note: "24/7 free national line for women." },
      { name: "Línea 137 (víctimas de violencia)", phone: "137", tel: "137", note: "24/7 crisis intervention with in-person teams." },
      { name: "Línea 102 (children)", phone: "102", tel: "102", note: "Free helpline for children & adolescents." },
      { name: "Centro de Asistencia al Suicida", phone: "135", tel: "135", note: "Free suicide prevention line." },
      { name: "Emergencia", phone: "911", tel: "911", note: "Immediate danger." },
    ],
  },
  {
    code: "CL",
    name: "Chile",
    items: [
      { name: "SernamEG Fono 1455", phone: "1455", tel: "1455", note: "24/7 free line for women experiencing violence." },
      { name: "Fono Niñez 147", phone: "147", tel: "147", note: "Support for children & adolescents." },
      { name: "Salud Responde (crisis)", phone: "600 360 7777", tel: "6003607777", note: "Mental health & suicide crisis support." },
      { name: "Emergencia", phone: "133", tel: "133", note: "Immediate danger (police)." },
    ],
  },
  {
    code: "SE",
    name: "Sweden",
    items: [
      { name: "Kvinnofridslinjen", phone: "020-50 50 50", tel: "020505050", note: "24/7 free national women's helpline." },
      { name: "Roks (shelter network)", href: "https://www.roks.se/", note: "Directory of women's & girls' shelters." },
      { name: "BRIS (children)", phone: "116 111", tel: "116111", note: "Free helpline for children under 18." },
      { name: "Mind Självmordslinjen", phone: "90101", tel: "90101", note: "24/7 suicide crisis chat & phone." },
      { name: "RFSL Stödmottagning (LGBTQ+)", phone: "020-34 13 16", tel: "020341316", note: "Support for LGBTQ+ victims of violence." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "NO",
    name: "Norway",
    items: [
      { name: "VO-linjen (24/7)", phone: "116 006", tel: "116006", note: "Free national helpline for victims of violence." },
      { name: "Krisesentersekretariatet", href: "https://www.krisesenter.com/", note: "Directory of crisis shelters." },
      { name: "Alarmtelefonen for barn og unge", phone: "116 111", tel: "116111", note: "24/7 for children & youth." },
      { name: "Mental Helse Hjelpetelefonen", phone: "116 123", tel: "116123", note: "24/7 crisis/suicide line." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "DK",
    name: "Denmark",
    items: [
      { name: "Lev Uden Vold", phone: "1888", tel: "1888", note: "24/7 national line for violence in close relationships." },
      { name: "LOKK (shelter network)", href: "https://lokk.dk/", note: "Women's crisis centre directory." },
      { name: "BørneTelefonen", phone: "116 111", tel: "116111", note: "Helpline for children & youth." },
      { name: "Livslinien (suicide)", phone: "70 201 201", tel: "70201201", note: "Daily crisis line." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "FI",
    name: "Finland",
    items: [
      { name: "Nollalinja", phone: "080 005 005", tel: "080005005", note: "24/7 free helpline for DV survivors." },
      { name: "Naisten Linja", phone: "0800 02400", tel: "080002400", note: "Free women's helpline." },
      { name: "Rikosuhripäivystys (victim support)", phone: "116 006", tel: "116006", note: "Support for victims of crime." },
      { name: "MIELI Crisis Helpline", phone: "09 2525 0111", tel: "0925250111", note: "24/7 crisis & suicide support." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "BE",
    name: "Belgium",
    items: [
      { name: "1712 (violence, abuse, child mistreatment)", phone: "1712", tel: "1712", note: "Free line, Mon–Fri 9am–5pm." },
      { name: "SOS Viol", phone: "0800 98 100", tel: "080098100", note: "Free line for sexual violence survivors." },
      { name: "Awel (children)", phone: "102", tel: "102", note: "Free helpline for children & youth." },
      { name: "Centre de Prévention du Suicide", phone: "0800 32 123", tel: "080032123", note: "24/7 suicide crisis line." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "CH",
    name: "Switzerland",
    items: [
      { name: "Frauenhaus Dachorganisation", href: "https://www.frauenhaus-schweiz.ch/", note: "Directory of women's shelters." },
      { name: "Opferhilfe Schweiz (victim support)", href: "https://www.opferhilfe-schweiz.ch/", note: "Cantonal victim support offices." },
      { name: "Pro Juventute (children)", phone: "147", tel: "147", note: "24/7 free helpline for children & youth." },
      { name: "Die Dargebotene Hand", phone: "143", tel: "143", note: "24/7 emotional support & crisis line." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "AT",
    name: "Austria",
    items: [
      { name: "Frauenhelpline gegen Gewalt", phone: "0800 222 555", tel: "0800222555", note: "24/7 free national women's helpline." },
      { name: "Frauenhäuser Österreich", href: "https://www.aoef.at/", note: "Directory of Austrian women's shelters." },
      { name: "Rat auf Draht (children)", phone: "147", tel: "147", note: "24/7 free helpline for children & youth." },
      { name: "Telefonseelsorge", phone: "142", tel: "142", note: "24/7 crisis & suicide line." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "PL",
    name: "Poland",
    items: [
      { name: "Niebieska Linia", phone: "800 120 002", tel: "800120002", note: "24/7 free helpline for family violence victims." },
      { name: "Feminoteka (women)", phone: "888 88 33 88", tel: "888883388", note: "Mon–Fri, support for women survivors." },
      { name: "Telefon Zaufania dla Dzieci", phone: "116 111", tel: "116111", note: "Helpline for children & youth." },
      { name: "Antydepresyjny Telefon Zaufania", phone: "22 484 88 01", tel: "224848801", note: "Depression & suicide crisis line." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "PT",
    name: "Portugal",
    items: [
      { name: "Linha SOS 800 202 148", phone: "800 202 148", tel: "800202148", note: "24/7 free national DV line." },
      { name: "APAV (victim support)", phone: "116 006", tel: "116006", note: "Free line for all victims of crime." },
      { name: "SOS Criança", phone: "116 111", tel: "116111", note: "Helpline for children & youth." },
      { name: "SOS Voz Amiga", phone: "213 544 545", tel: "213544545", note: "Emotional support & suicide prevention." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "NG",
    name: "Nigeria",
    items: [
      { name: "Mirabel Centre (Lagos, sexual assault)", phone: "0818 356 0334", tel: "08183560334", note: "Sexual assault referral centre." },
      { name: "Project Alert on Violence Against Women", phone: "0805 090 1445", tel: "08050901445", note: "24/7 crisis support & shelter." },
      { name: "WARIF (Women at Risk International)", phone: "0800 9210 0009", tel: "080092100009", note: "24/7 free sexual violence support." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "KE",
    name: "Kenya",
    items: [
      { name: "GBV Hotline 1195", phone: "1195", tel: "1195", note: "24/7 free national gender-based violence line." },
      { name: "Childline Kenya 116", phone: "116", tel: "116", note: "24/7 free child helpline." },
      { name: "Befrienders Kenya (suicide/crisis)", phone: "+254 722 178 177", tel: "254722178177", note: "Emotional support & crisis line." },
      { name: "Emergency", phone: "999 / 112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    items: [
      { name: "Dubai Foundation for Women & Children", phone: "800 111", tel: "800111", note: "24/7 shelter & support hotline." },
      { name: "Ewa'a Shelters (Abu Dhabi)", phone: "800 7283", tel: "8007283", note: "Support for victims of abuse & trafficking." },
      { name: "Child Protection Center", phone: "116 111", tel: "116111", note: "Report child abuse." },
      { name: "Estijaba (mental health)", phone: "8001717", tel: "8001717", note: "Confidential support line." },
      { name: "Emergency", phone: "999", tel: "999", note: "Immediate danger." },
    ],
  },
  {
    code: "TR",
    name: "Türkiye (Turkey)",
    items: [
      { name: "Alo 183 (Social Support Line)", phone: "183", tel: "183", note: "24/7 free women, family & children support." },
      { name: "Mor Çatı Women's Shelter Foundation", href: "https://en.morcati.org.tr/", note: "Solidarity centre & shelter." },
      { name: "KADEM", href: "https://kadem.org.tr/", note: "Women & Democracy Association support services." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "CO",
    name: "Colombia",
    items: [
      { name: "Línea 155 (violencia contra la mujer)", phone: "155", tel: "155", note: "Orientación gratuita 24/7 para mujeres víctimas de violencia." },
      { name: "Línea 122 (Fiscalía)", phone: "122", tel: "122", note: "Denuncias penales." },
      { name: "ICBF (niñez)", phone: "141", tel: "141", note: "Protección de niños, niñas y adolescentes." },
      { name: "Emergencias", phone: "123", tel: "123", note: "Peligro inmediato." },
    ],
  },
  {
    code: "PE",
    name: "Peru",
    items: [
      { name: "Línea 100 (MIMP)", phone: "100", tel: "100", note: "Atención gratuita 24/7 en violencia familiar y sexual." },
      { name: "Centro Emergencia Mujer", href: "https://www.gob.pe/mimp", note: "Servicios gratuitos: legal, psicológico y social." },
      { name: "Emergencias / Policía", phone: "105", tel: "105", note: "Peligro inmediato." },
    ],
  },
  {
    code: "EC",
    name: "Ecuador",
    items: [
      { name: "Emergencias ECU 911", phone: "911", tel: "911", note: "Peligro inmediato, atención 24/7." },
      { name: "Ministerio de la Mujer y Derechos Humanos", href: "https://www.derechoshumanos.gob.ec/", note: "Servicios de protección y rutas de denuncia." },
    ],
  },
  {
    code: "UY",
    name: "Uruguay",
    items: [
      { name: "Línea Mujer (InMujeres)", phone: "0800 7272", tel: "08007272", note: "Servicio nacional gratuito de orientación en violencia de género." },
      { name: "Emergencias / Policía", phone: "911", tel: "911", note: "Peligro inmediato." },
    ],
  },
  {
    code: "CR",
    name: "Costa Rica",
    items: [
      { name: "INAMU – Línea 800-300-3000", phone: "800 300 3000", tel: "8003003000", note: "Orientación en violencia contra las mujeres." },
      { name: "Emergencias", phone: "911", tel: "911", note: "Peligro inmediato." },
    ],
  },
  {
    code: "RU",
    name: "Russia",
    items: [
      { name: "ANNA Centre helpline", phone: "8 800 7000 600", tel: "88007000600", note: "All-Russian hotline for women survivors of violence." },
      { name: "Nasiliu.net", href: "https://nasiliu.net/", note: "Legal & psychological support centre." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "UA",
    name: "Ukraine",
    items: [
      { name: "National hotline on domestic violence (La Strada)", phone: "0 800 500 335 / 116 123", tel: "0800500335", note: "Free, confidential support for survivors." },
      { name: "Government hotline 1547", phone: "1547", tel: "1547", note: "State hotline on domestic and gender-based violence." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "GR",
    name: "Greece",
    items: [
      { name: "SOS 15900", phone: "15900", tel: "15900", note: "24/7 national helpline for women survivors of violence." },
      { name: "General Secretariat for Demography & Family Policy and Gender Equality", href: "https://isotita.gr/", note: "Counselling centres & shelters." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "RO",
    name: "Romania",
    items: [
      { name: "Helpline 0800 500 333", phone: "0800 500 333", tel: "0800500333", note: "Free 24/7 line for victims of domestic violence, trafficking & discrimination." },
      { name: "ANES", href: "https://anes.gov.ro/", note: "National agency for equal opportunities — shelters & services." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "CZ",
    name: "Czechia",
    items: [
      { name: "Bílý kruh bezpečí (victim support)", phone: "116 006", tel: "116006", note: "Free 24/7 helpline for victims of crime and domestic violence." },
      { name: "ROSA centrum", href: "https://www.rosacentrum.cz/", note: "Support for women survivors of domestic violence." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "HU",
    name: "Hungary",
    items: [
      { name: "OKIT crisis line", phone: "06 80 20 55 20", tel: "0680205520", note: "Free 24/7 national crisis line for victims of abuse." },
      { name: "NANE Association", href: "https://nane.hu/", note: "Women's rights association helpline & information." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "HR",
    name: "Croatia",
    items: [
      { name: "Women's helpline (Autonomna ženska kuća)", phone: "0800 55 44", tel: "080055444", note: "Support for women survivors of violence." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "RS",
    name: "Serbia",
    items: [
      { name: "SOS helpline for women", phone: "0800 100 007", tel: "0800100007", note: "Free national SOS line for women survivors of violence." },
      { name: "Autonomous Women's Center", href: "https://www.womenngo.org.rs/en/", note: "Legal & psychological support." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "BG",
    name: "Bulgaria",
    items: [
      { name: "National helpline for victims of violence", phone: "0800 18 676", tel: "080018676", note: "Free 24/7 helpline (Animus Association)." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "CN",
    name: "China",
    items: [
      { name: "All-China Women's Federation hotline", phone: "12338", tel: "12338", note: "Women's rights & protection hotline." },
      { name: "Public security / police", phone: "110", tel: "110", note: "Immediate danger. Ask for a written warning (告诫书)." },
      { name: "Medical emergency", phone: "120", tel: "120", note: "Ambulance." },
    ],
  },
  {
    code: "TW",
    name: "Taiwan",
    items: [
      { name: "Protection hotline 113", phone: "113", tel: "113", note: "24/7 line for domestic violence, sexual assault & child protection." },
      { name: "Emergency", phone: "110", tel: "110", note: "Police, immediate danger." },
    ],
  },
  {
    code: "HK",
    name: "Hong Kong",
    items: [
      { name: "Social Welfare Department hotline", phone: "2343 2255", tel: "23432255", note: "24-hour hotline including family violence support." },
      { name: "Harmony House", href: "https://www.harmonyhousehk.org/", note: "Shelter & counselling for women and children." },
      { name: "Emergency", phone: "999", tel: "999", note: "Immediate danger." },
    ],
  },
  {
    code: "TH",
    name: "Thailand",
    items: [
      { name: "Social Assistance Center 1300", phone: "1300", tel: "1300", note: "24/7 Ministry of Social Development helpline (abuse, shelter, referral)." },
      { name: "Emergency / police", phone: "191", tel: "191", note: "Immediate danger." },
      { name: "Tourist Police", phone: "1155", tel: "1155", note: "English-speaking assistance." },
    ],
  },
  {
    code: "MY",
    name: "Malaysia",
    items: [
      { name: "Talian Kasih", phone: "15999", tel: "15999", note: "24/7 government helpline for abuse & family crisis (WhatsApp 019-261 5999)." },
      { name: "Women's Aid Organisation (WAO)", phone: "03-3000 8858", tel: "0330008858", note: "Hotline & TINA SMS/WhatsApp 018-988 8058." },
      { name: "Emergency", phone: "999", tel: "999", note: "Immediate danger." },
    ],
  },
  {
    code: "ID",
    name: "Indonesia",
    items: [
      { name: "SAPA 129 (KemenPPPA)", phone: "129", tel: "129", note: "National hotline for women & children survivors (WhatsApp 08111-129-129)." },
      { name: "Komnas Perempuan", href: "https://komnasperempuan.go.id/", note: "National Commission on Violence Against Women." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "VN",
    name: "Vietnam",
    items: [
      { name: "Peace House / CSAGA support", href: "https://csaga.org.vn/", note: "Counselling & shelter for women and girls survivors." },
      { name: "Child protection hotline", phone: "111", tel: "111", note: "24/7 national child protection line." },
      { name: "Emergency / police", phone: "113", tel: "113", note: "Immediate danger." },
    ],
  },
  {
    code: "PK",
    name: "Pakistan",
    items: [
      { name: "Ministry of Human Rights helpline", phone: "1099", tel: "1099", note: "Free legal advice & referral, including gender-based violence." },
      { name: "Madadgaar National Helpline", phone: "1098", tel: "1098", note: "Support for women and children in crisis." },
      { name: "Emergency / police", phone: "15", tel: "15", note: "Immediate danger." },
    ],
  },
  {
    code: "BD",
    name: "Bangladesh",
    items: [
      { name: "National helpline 109", phone: "109", tel: "109", note: "Government helpline for violence against women & child marriage." },
      { name: "Multi-Sectoral Programme 10921", phone: "10921", tel: "10921", note: "Support centre: doctors, counsellors, lawyers, police referral." },
      { name: "Emergency", phone: "999", tel: "999", note: "Immediate danger." },
    ],
  },
  {
    code: "LK",
    name: "Sri Lanka",
    items: [
      { name: "Women's helpline 1938", phone: "1938", tel: "1938", note: "National helpline for women in distress." },
      { name: "Child protection 1929", phone: "1929", tel: "1929", note: "National Child Protection Authority." },
      { name: "Emergency / police", phone: "119", tel: "119", note: "Immediate danger." },
    ],
  },
  {
    code: "NP",
    name: "Nepal",
    items: [
      { name: "Women & children helpline 1145", phone: "1145", tel: "1145", note: "Government helpline for gender-based violence." },
      { name: "Emergency / police", phone: "100", tel: "100", note: "Immediate danger." },
    ],
  },
  {
    code: "EG",
    name: "Egypt",
    items: [
      { name: "National Council for Women complaints office", phone: "15115", tel: "15115", note: "Support & complaints line for women." },
      { name: "Emergency / police", phone: "122", tel: "122", note: "Immediate danger." },
      { name: "Ambulance", phone: "123", tel: "123", note: "Medical emergency." },
    ],
  },
  {
    code: "MA",
    name: "Morocco",
    items: [
      { name: "Green line for women survivors", phone: "8350", tel: "8350", note: "National line for women victims of violence." },
      { name: "Emergency / police", phone: "19", tel: "19", note: "Immediate danger (190 from mobile)." },
    ],
  },
  {
    code: "GH",
    name: "Ghana",
    items: [
      { name: "DOVVSU (Domestic Violence & Victim Support Unit)", phone: "0800 111 222", tel: "0800111222", note: "Ghana Police Service unit for domestic violence cases." },
      { name: "Domestic Violence Secretariat", href: "https://mogcsp.gov.gh/", note: "Ministry of Gender, Children & Social Protection services." },
      { name: "Emergency / police", phone: "191", tel: "191", note: "Immediate danger." },
    ],
  },
  {
    code: "TZ",
    name: "Tanzania",
    items: [
      { name: "Child & GBV helpline 116", phone: "116", tel: "116", note: "Free national helpline for violence against women & children." },
      { name: "Emergency / police", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "UG",
    name: "Uganda",
    items: [
      { name: "Sauti 116 helpline", phone: "116", tel: "116", note: "Free national GBV & child protection helpline." },
      { name: "Police GBV desk", phone: "999 / 112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "ET",
    name: "Ethiopia",
    items: [
      { name: "Ethiopian Women Lawyers Association", href: "https://ewla-et.org/", note: "Free legal aid for women survivors." },
      { name: "Emergency / police", phone: "991", tel: "991", note: "Immediate danger." },
    ],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    items: [
      { name: "National Family Safety Program 1919", phone: "1919", tel: "1919", note: "Reports of domestic violence & abuse." },
      { name: "Emergency / police", phone: "999", tel: "999", note: "Immediate danger." },
    ],
  },
  {
    code: "QA",
    name: "Qatar",
    items: [
      { name: "Aman Center (Protection & Social Rehabilitation)", phone: "919", tel: "919", note: "Support for women & children survivors of violence." },
      { name: "Emergency", phone: "999", tel: "999", note: "Immediate danger." },
    ],
  },
  {
    code: "KW",
    name: "Kuwait",
    items: [
      { name: "Ministry of Social Affairs family support", href: "https://www.msal.gov.kw/", note: "Shelter and family protection services." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "JO",
    name: "Jordan",
    items: [
      { name: "Family Protection Department", phone: "911", tel: "911", note: "Ask for the Family Protection Department (FPD)." },
      { name: "Jordanian Women's Union hotline", phone: "+962 6 5675729", tel: "+96265675729", note: "Counselling, legal aid & shelter." },
    ],
  },
  {
    code: "LB",
    name: "Lebanon",
    items: [
      { name: "KAFA helpline", phone: "03 018 019", tel: "03018019", note: "24/7 support for women survivors of violence." },
      { name: "ABAAD", href: "https://www.abaadmena.org/", note: "Midway shelters & support for women and girls." },
      { name: "Emergency / police", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "KZ",
    name: "Kazakhstan",
    items: [
      { name: "National helpline 111", phone: "111", tel: "111", note: "Support line for children & families in crisis." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
    ],
  },
  {
    code: "GE",
    name: "Georgia",
    items: [
      { name: "State hotline 116 006", phone: "116 006", tel: "116006", note: "Free 24/7 hotline for victims of domestic violence." },
      { name: "Emergency", phone: "112", tel: "112", note: "Immediate danger." },
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
      { name: "The Trevor Project (LGBTQ+ youth crisis)", phone: "866-488-7386 / text 678678", href: "tel:8664887386", note: "24/7 crisis support for LGBTQ+ young people. Text START to 678678 or chat at chat.trvr.org.", },
      { name: "StrongHearts Native Helpline", phone: "844-762-8483", href: "tel:8447628483", note: "Helpline for Native Americans and Alaska Natives." },
      { name: "National Teen Dating Abuse Helpline", phone: "866-311-9474", href: "tel:8663119474", note: "For young people experiencing abuse or curious about healthy relationships." },
      { name: "Deaf and Hard of Hearing Helpline", phone: "Video phone: 855-812-1001", href: "tel:8558121001", note: "Helpline for individuals who are deaf and hard of hearing." },
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
      { name: "loveisrespect.org", href: "https://www.loveisrespect.org/", note: "Online chat, articles, and quizzes about healthy relationships and dating abuse." },
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
  function keepPrivateLinksInCurrentTab(event: MouseEvent<HTMLDivElement>) {
    if (!isHideHistoryEnabled() || event.button !== 0) return;
    const anchor = (event.target as HTMLElement).closest("a");
    const href = anchor?.href;
    if (!href || !href.startsWith("http")) return;
    event.preventDefault();
    event.stopPropagation();
    window.location.replace(href);
  }

  return (
    <div className="paper-bg" onClickCapture={keepPrivateLinksInCurrentTab}>
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
          {[...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
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
                  {(it.sms || it.fax || it.email) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {it.sms && (
                        <a href={`sms:${it.smsTel || it.sms}`} className="rounded-full border border-ink-300/60 bg-white px-2 py-1 text-ink-900 hover:border-rose-500">
                          ✉️ SMS {it.sms}
                        </a>
                      )}
                      {it.email && (
                        <a href={`mailto:${it.email}`} className="rounded-full border border-ink-300/60 bg-white px-2 py-1 text-ink-900 hover:border-rose-500">
                          📧 {it.email}
                        </a>
                      )}
                      {it.fax && (
                        <span className="rounded-full border border-ink-300/60 bg-white px-2 py-1 text-ink-500">
                          📠 Fax {it.fax}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {it.tel ? (
                  <a data-testid={`intl-link-${slug(it.name)}`} href={`tel:${it.tel}`} className="btn-rose shrink-0 !px-4 !py-2 !text-xs">
                    {it.phone}
                  </a>
                ) : (
                  <a
                    data-testid={`intl-link-${slug(it.name)}`}
                    href={it.href}
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
            className="btn-rose mt-4 inline-flex !px-5 !py-2.5 !text-xs"
          >
            Find a helpline in your country →
          </a>
        </div>
      )}
    </section>
  );
}
