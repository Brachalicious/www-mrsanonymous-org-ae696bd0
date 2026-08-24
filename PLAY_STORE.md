# Google Play submission checklist — MrsANONymous

The Android app is a Trusted Web Activity (TWA) wrapper around https://mrsanonymous.org.

## 1. Build the Android package (Bubblewrap)

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://mrsanonymous.org/manifest.webmanifest
# package id: org.mrsanonymous.app
bubblewrap build          # produces app-release-bundle.aab + app-release-signed.apk
```

Upload `app-release-bundle.aab` to Play Console → Production (or Internal testing first).

## 2. Digital Asset Links (required, or the app shows a URL bar)

`public/.well-known/assetlinks.json` is already served at
https://mrsanonymous.org/.well-known/assetlinks.json.

Replace `REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT` with the SHA-256 from
Play Console → Release → Setup → **App signing** (App signing key certificate), then republish
the site. Keep the upload-key fingerprint in the list too if you test locally.

## 3. Store listing copy

- **App name:** MrsANONymous — Safety & Support
- **Short description (≤80):** Anonymous safety, support, and evidence tools for survivors of abuse.
- **Full description:** Free, 100% anonymous support for women and girls facing domestic violence.
  Quick-exit, hidden history, a disguised calculator lock, private notebooks for documenting
  incidents, exportable incident reports, localized emergency numbers and hotlines in 17+
  languages, and an anonymous community board. No email, no phone number, no tracking.
- **Category:** Health & Fitness (alt: Lifestyle) · **Tags:** safety, support
- **Contact email:** mysticminded33@gmail.com
- **Privacy policy URL:** https://mrsanonymous.org/privacy
- **Account deletion URL:** https://mrsanonymous.org/delete-account
- **Graphics needed:** 512×512 icon (have: `public/app-icon-512.png`), 1024×500 feature graphic,
  2–8 phone screenshots (min 320px side), optional 7"/10" tablet screenshots.

## 4. Data safety form

| Question | Answer |
| --- | --- |
| Collects data | Yes |
| Personal info | Nickname + password only (no name, email, phone) |
| User content | Notes, journal entries, stories, support messages, uploaded files/audio |
| Location | **Not collected by us** — device location is shared directly with emergency services when the user chooses |
| Encrypted in transit | Yes |
| Users can request deletion | Yes — in-app and via the deletion URL |
| Data shared with third parties | No |
| Ads / analytics SDKs | None |

## 5. Content rating (IARC questionnaire)

Rated **Teen / 12+**: contains discussion of domestic violence and abuse, plus user-generated
content. Declare user-generated content, with reporting/blocking and moderation (in place:
report + block on every story, admin moderation queue, 24-hour review target).

## 6. Other declarations

- Target audience: 13+ (not designed for children; no ads).
- Ads: none. In-app purchases: none.
- Government apps / financial features: no.
- Health apps: not a medical or emergency service — the disclaimer appears in-app, in Terms,
  and on the Download page.
- Permissions used: location (foreground, user-initiated), microphone/storage (optional
  evidence recording), telephony intents (`tel:`/`sms:` links only, no CALL_PHONE permission).

## 7. Pre-launch verification

- Install from Internal testing and confirm no browser URL bar (asset links verified).
- Quick Exit, calculator lock, offline behaviour, and emergency buttons all work in the wrapper.
- Account deletion works end to end from a fresh test account.
