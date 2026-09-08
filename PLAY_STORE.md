# Google Play submission checklist — MrsANONymous

The Android app is a Trusted Web Activity (TWA) wrapper around https://mrsanonymous.org.

## 1. Build the Android package (Bubblewrap)

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://mrsanonymous.org/manifest.webmanifest
# package id: www.MrsAnonymous.org
bubblewrap build          # produces app-release-bundle.aab + app-release-signed.apk
```

Upload `app-release-bundle.aab` to Play Console → Production (or Internal testing first).

## 2. Digital Asset Links (required, or the app shows a URL bar)

`public/.well-known/assetlinks.json` is already served at
https://mrsanonymous.org/.well-known/assetlinks.json.

The Play App Signing SHA-256 fingerprint
(`27:D7:FE:5E:...:40:31:1E`) is filled in. If you also test a locally built APK,
add the upload-key SHA-256 as a second entry in the same list.

## 2b. "Signing not valid" on upload

Play rejects an .aab that is not signed by the **upload key** registered for the app.

```bash
# rebuild and sign with the keystore Bubblewrap created (android.keystore)
bubblewrap build
# verify before uploading
jarsigner -verify -verbose -certs app-release-bundle.aab | head -20
keytool -list -v -keystore android.keystore -alias android | grep SHA256
```

The SHA-256 printed by `keytool` must match Play Console → App signing →
**Upload key certificate**. If it does not, you are signing with the wrong keystore:
use the original one, or request an upload-key reset in Play Console
(App signing → Request upload key reset) and upload the new certificate.
Never re-sign with the App signing key — Google holds that one.

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
- **Graphics ready:** 512×512 icon (`public/app-icon-512.png`), 1024×500 feature graphic
  (`play-feature-graphic.jpg` in project files), 6 phone screenshots 1080×1920
  (`play-screenshots/1-home … 6-download.png`). Tablet screenshots optional.


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
