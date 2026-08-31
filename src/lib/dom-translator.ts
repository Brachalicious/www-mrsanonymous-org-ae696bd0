// Runtime DOM auto-translator. Walks visible text nodes and translates them
// to the selected language using the public Google Translate endpoint.
// Original English text is preserved per text-node so switching back to
// English (or to another language) always translates from the source.

import { translateText } from "@/lib/translations";
import type { LangCode } from "@/lib/translations";

const originals = new WeakMap<Text, string>();
// Text nodes we have written into, mapped to the exact value we wrote.
// Lets us detect when React re-renders a node with new content so we don't
// clobber fresh UI text with a stale "original".
const applied = new WeakMap<Text, string>();
// cache: `${lang}\u0001${text}` -> translated
const cache = new Map<string, string>();

const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "SVG",
]);

function shouldSkip(node: Node): boolean {
  let el: Node | null = node.parentNode;
  while (el && el.nodeType === 1) {
    const e = el as Element;
    if (SKIP_TAGS.has(e.tagName)) return true;
    if (e.getAttribute("data-no-translate") !== null) return true;
    if (e.getAttribute("translate") === "no") return true;
    el = e.parentNode;
  }
  return false;
}

function collectTextNodes(root: Node): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = node as Text;
      if (!t.nodeValue || !t.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(t)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n = walker.nextNode();
  while (n) {
    out.push(n as Text);
    n = walker.nextNode();
  }
  return out;
}

async function batchTranslate(
  texts: string[],
  lang: LangCode,
): Promise<string[]> {
  // Join with a rare sentinel so we can split back.
  const SEP = "\n@@@LVBL@@@\n";
  const chunks: string[][] = [];
  let current: string[] = [];
  let size = 0;
  const LIMIT = 1500; // conservative URL length
  for (const t of texts) {
    if (size + t.length + SEP.length > LIMIT && current.length) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(t);
    size += t.length + SEP.length;
  }
  if (current.length) chunks.push(current);

  const results: string[] = [];
  for (const chunk of chunks) {
    const joined = chunk.join(SEP);
    const translated = await translateText(joined, lang, "en");
    const parts = translated.split(/\n\s*@@@\s*LVBL\s*@@@\s*\n/);
    if (parts.length === chunk.length) {
      results.push(...parts);
    } else {
      // Fallback: translate one by one.
      for (const t of chunk) {
        results.push(await translateText(t, lang, "en"));
      }
    }
  }
  return results;
}

let running = false;
let queued = false;
let currentLang: LangCode = "en";

// ---- Attribute translation (placeholders, tooltips, alt text, aria labels) ----
const ATTRS = ["placeholder", "title", "aria-label", "alt", "aria-placeholder"];
const attrOriginals = new WeakMap<Element, Map<string, string>>();
const attrApplied = new WeakMap<Element, Map<string, string>>();

type Slot = {
  read: () => string;
  write: (v: string) => void;
  connected: () => boolean;
  original: string;
  current: string;
  isApplied: boolean;
  markApplied: (v: string) => void;
  clearApplied: () => void;
};

function collectSlots(): Slot[] {
  const slots: Slot[] = [];

  for (const n of collectTextNodes(document.body)) {
    const ours = applied.get(n);
    if (!originals.has(n) || (ours !== undefined && ours !== n.nodeValue)) {
      originals.set(n, n.nodeValue ?? "");
      applied.delete(n);
    }
    slots.push({
      read: () => n.nodeValue ?? "",
      write: (v) => {
        n.nodeValue = v;
      },
      connected: () => n.isConnected,
      original: originals.get(n) ?? n.nodeValue ?? "",
      current: n.nodeValue ?? "",
      isApplied: applied.get(n) === n.nodeValue,
      markApplied: (v) => applied.set(n, v),
      clearApplied: () => applied.delete(n),
    });
  }

  const els = document.body.querySelectorAll<HTMLElement>(
    "[placeholder],[title],[aria-label],[alt],[aria-placeholder]",
  );
  els.forEach((el) => {
    if (shouldSkip(el.firstChild ?? el) || el.getAttribute("translate") === "no") return;
    if (el.closest("[data-no-translate],[translate='no']")) return;
    for (const attr of ATTRS) {
      const val = el.getAttribute(attr);
      if (!val || !val.trim()) continue;
      let origs = attrOriginals.get(el);
      if (!origs) {
        origs = new Map();
        attrOriginals.set(el, origs);
      }
      let apps = attrApplied.get(el);
      if (!apps) {
        apps = new Map();
        attrApplied.set(el, apps);
      }
      const ours = apps.get(attr);
      if (!origs.has(attr) || (ours !== undefined && ours !== val)) {
        origs.set(attr, val);
        apps.delete(attr);
      }
      slots.push({
        read: () => el.getAttribute(attr) ?? "",
        write: (v) => el.setAttribute(attr, v),
        connected: () => el.isConnected,
        original: origs.get(attr) ?? val,
        current: val,
        isApplied: apps.get(attr) === val,
        markApplied: (v) => apps!.set(attr, v),
        clearApplied: () => apps!.delete(attr),
      });
    }
  });

  return slots;
}

async function translateNow(lang: LangCode) {
  if (typeof document === "undefined") return;
  const slots = collectSlots();

  if (lang === "en") {
    for (const s of slots) {
      if (!s.isApplied) continue;
      if (s.current !== s.original) {
        s.write(s.original);
        s.clearApplied();
      }
    }
    return;
  }

  // Determine which need translation.
  const need: { slot: Slot; text: string }[] = [];
  for (const s of slots) {
    const orig = s.original;
    const cached = cache.get(`${lang}\u0001${orig}`);
    if (cached !== undefined) {
      if (s.current !== cached) {
        s.write(cached);
        s.markApplied(cached);
      }
    } else {
      need.push({ slot: s, text: orig });
    }
  }

  if (!need.length) return;

  // Dedupe identical strings.
  const uniq = Array.from(new Set(need.map((x) => x.text)));
  const translated = await batchTranslate(uniq, lang);
  const map = new Map<string, string>();
  uniq.forEach((t, i) => map.set(t, translated[i] ?? t));

  for (const { slot, text } of need) {
    const out = map.get(text) ?? text;
    cache.set(`${lang}\u0001${text}`, out);
    if (currentLang === lang && slot.connected()) {
      slot.write(out);
      slot.markApplied(out);
    }
  }
}

async function schedule() {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  try {
    await translateNow(currentLang);
  } finally {
    running = false;
    if (queued) {
      queued = false;
      schedule();
    }
  }
}

let observer: MutationObserver | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function ensureObserver() {
  if (observer || typeof document === "undefined") return;
  observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => schedule(), 250);
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

export function applyLanguageToDom(lang: LangCode) {
  currentLang = lang;
  if (typeof document === "undefined") return;
  ensureObserver();
  schedule();
}