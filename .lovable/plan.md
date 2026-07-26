## Goal
Add multi-language support in two places:
1. **Emergency Text-to-911** — let user type their custom message in their native language; auto-translate to English before sending to 911 (911 dispatchers read English).
2. **App-wide language switcher** — a button in the navbar that translates the UI into the selected language.

---

## Part 1: Emergency widget language + translation

In `src/components/EmergencyWidget.tsx`:
- Add a language `<select>` above the custom-message textarea (~15 common languages: English, Spanish, French, Arabic, Chinese, Hindi, Portuguese, Russian, Vietnamese, Tagalog, Korean, Japanese, German, Farsi, Ukrainian).
- Set the textarea's `lang` and `dir` attributes based on the choice (so mobile keyboards switch to that language's keys, and RTL languages render correctly).
- Persist the choice in `localStorage`.
- When building the SMS body: if the chosen language ≠ English, call a free translation endpoint (`https://translate.googleapis.com/translate_a/single?client=gtx&sl=<lang>&tl=en&dt=t&q=<msg>`) to translate the user's message to English. Send both to 911:
  - Line 1: English translation (so dispatcher understands)
  - Line 2: `[Original (<lang>): <original message>]`
  - Then address, coordinates, map link.
- Translate on-demand when "Text 911" is tapped (with a small loading state); fall back to sending the original text if the fetch fails so the SMS is never blocked.

## Part 2: App-wide language switcher

Add a lightweight i18n layer without pulling in i18next:

- New file `src/contexts/LanguageContext.tsx`:
  - `LanguageProvider` stores selected language in `localStorage` (`mrsanon:lang`), defaults to browser language or `en`.
  - Exposes `useLanguage()` → `{ lang, setLang, t(key) }`.
  - `t(key)` looks up `dictionaries[lang][key]` and falls back to English, then to the key itself.

- New file `src/lib/translations.ts`:
  - Export a `dictionaries` map keyed by language code.
  - Cover the ~15 languages above.
  - Include keys for the highest-visibility UI: navbar tabs, safety strip buttons ("Quick Exit", "Call 911"), emergency widget labels, home hero copy, footer.
  - For strings not in the dictionary, English is shown (graceful fallback).

- Wrap the app: in `src/routes/__root.tsx`, add `<LanguageProvider>` inside `<AuthProvider>` so all pages get it.

- Update `src/components/Navbar.tsx`:
  - Add a compact "🌐 Language" dropdown in the top safety strip (next to Quick Exit / Call 911).
  - Setting it calls `setLang(...)` and updates `<html lang>` and `dir` via effect.
  - Replace the hardcoded labels for the primary nav items and safety-strip buttons with `t("nav.notebooks")`, etc.

- Update `src/components/EmergencyWidget.tsx` labels to use `t(...)` so the widget itself is translated too.

- Update `src/routes/index.tsx` hero + CTAs and `src/components/Footer.tsx` to use `t(...)` for the most-seen strings. Deep page content stays English for now (translating every route is out of scope for this pass); scaffolding is in place to add more keys later.

## Technical notes

- Endpoint used for translation: `translate.googleapis.com/translate_a/single` (public, no API key, used by many open-source translation libraries). Requests only fire when the user actually taps Text 911 in a non-English language.
- We do NOT auto-translate the whole app via Google — that would be a runtime network call on every page. Instead we ship a dictionary and fall back to English for missing keys.
- `<html lang>` is updated so screen readers and browser translation prompts behave correctly.
- No new dependencies.

## Files touched

- New: `src/contexts/LanguageContext.tsx`
- New: `src/lib/translations.ts`
- Edit: `src/components/EmergencyWidget.tsx` (language picker + translate on send)
- Edit: `src/components/Navbar.tsx` (language dropdown + t() calls)
- Edit: `src/routes/__root.tsx` (mount provider)
- Edit: `src/components/Footer.tsx`, `src/routes/index.tsx` (use t() for hero/footer)
