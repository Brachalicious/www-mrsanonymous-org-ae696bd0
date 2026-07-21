# Port MrsAnonymous.org into Lovable

## Goal
Rebuild the MrsAnonymous.org application (a warm, paper-like anonymous support platform for women and girls) inside the current Lovable TanStack Start project, using Lovable Cloud for backend data and auth.

## What we're building

### Design system
- Convert the existing Tailwind v3 design tokens (`ink-900`, `rose-500`, `cream-100`, warm paper backgrounds, `Cormorant Garamond` + `Figtree` + `Caveat` fonts) into Tailwind v4 CSS variables in `src/styles.css`.
- Add custom utility classes for `.note-card`, `.paper-bg`, `.btn-rose`, `.btn-ghost`, `.hand-note`, `.envelope-shadow`.

### Shared shell
- `src/routes/__root.tsx`: update head metadata (title, description, OG/Twitter) and wrap the app with the warm paper background.
- `src/components/Navbar.tsx`: sticky top nav with safety strip, brand, auth links, Quick Exit.
- `src/components/Footer.tsx`: simple footer.
- `src/components/QuickExit.tsx`: ESC/button handler that replaces the tab with `https://www.google.com`.
- `src/components/EmergencyWidget.tsx`: floating crisis widget.

### Public pages (each as a separate route)
- `/` — Home: hero, private-letter envelope, hand-signal section, path cards, anonymous contact form, bottom band.
- `/about` — About us.
- `/women` — Women landing page with hotline links.
- `/girls` — Girls landing page with hotline links.
- `/resources` — Resource directory with state/country picker.
- `/get-help/women` and `/get-help/girls` — Urgent help pages.
- `/login` and `/signup` — Anonymous nickname + password auth.
- `/tell-your-story` — Private notebooks dashboard (auth-gated).
- `/board` — Public stories with gentle blur reveal, topic tags, emoji reactions, supporters badge.
- `/tools` — Tools page (abuse journal, SOFY mode, silent panic — P2 backlog).

### Backend via Lovable Cloud / Supabase
- Enable Lovable Cloud.
- Schema:
  - `profiles` (id, nickname, audience, created_at)
  - `user_roles` (id, user_id, role)
  - `notebooks` (id, user_id, title, color, shared, share_as, topics, created_at, updated_at)
  - `entries` (id, notebook_id, content, mood, shared, share_as, topics, created_at, updated_at)
  - `reactions` (id, story_id, user_id, reaction_key)
  - `contacts` (id, message, nickname, audience, created_at)
  - `login_attempts` (id, identifier, count, locked_until)
- RLS policies enforcing:
  - Users can only read/write their own notebooks and entries.
  - Public read of shared stories and reactions counts.
  - Anonymous contact form inserts allowed to `anon`.
- Server functions for auth, notebooks, entries, stories, reactions, contact, support stats.

### Public assets
- Copy `hand-signal.jpg` from the repo into `public/hand-signal.jpg`.
- Copy app icons/manifest if needed.

### Safety & trust
- Quick Exit (ESC + button) implemented.
- Trigger warnings on the Board.
- Gentle blur reveal for stories.
- `data-testid` attributes on all interactive elements.
- XSS-safe output (no `dangerouslySetInnerHTML`).

## Phases

### Phase 1: Foundation
- Enable Lovable Cloud.
- Create design system in `src/styles.css`.
- Set up root layout, Navbar, Footer, Quick Exit, Emergency Widget.
- Add `public/hand-signal.jpg`.

### Phase 2: Public marketing pages
- Build Home, About, Women, Girls, Resources, Get Help, Contact.
- Add routes with proper `head()` metadata.

### Phase 3: Auth + notebooks
- Build Supabase auth flow using nickname/password (we'll use Supabase Auth with metadata for nickname).
- Build Login, Signup, Tell Your Story (notebooks + entries).
- Build Notebook detail page.

### Phase 4: Board + reactions
- Build public Board with trigger warning, gentle reveal, reactions, support stats.

### Phase 5: Tools + polish
- Tools page with Private Abuse Journal placeholder, SOFY mode, Silent Panic.
- PWA manifest, install prompt.
- Final responsive pass, test navigation, and publish.

## Technical details
- **Stack:** TanStack Start v1 + React 19 + Tailwind v4 + shadcn/ui + Lovable Cloud (Supabase).
- **Routing:** TanStack Router file-based routes (`src/routes/*.tsx`).
- **Data:** TanStack Query + `createServerFn` + Supabase.
- **Auth:** Supabase Auth with email/password under the hood; the app uses nickname as the displayed identifier (we'll generate a synthetic email or use Supabase metadata). Anonymous accounts mean we never store real names.
- **Images:** `/hand-signal.jpg` from the repo; other Unsplash textures reused per design guidelines.

## Out of scope / P2 backlog
- Drag-to-rip animation for sharing.
- Push notifications.
- Encrypted localStorage for journals.
- Admin dashboard for contact messages.
- Full FastAPI feature parity (SMS silent panic, geolocation). These can be added after the core app is live.

## Next step
Approve the plan, and I'll start with Phase 1 (foundation + Lovable Cloud setup).