# 🌱 GreenUp — Plant. Clean. Grow.

A student sustainability tracker: log trees and clean-ups with **photo + GPS proof**,
watch them appear on a live **world map**, climb the leaderboardgit. 
Built with plain HTML/CSS/JS + Supabase for database + Google Maps — no
build step, no framework.

## Filesclear


| File | What it is |
|---|---|
| `index.html` | the app (open this) |
| `admin.html` + `admin.js` | role-gated **admin console** (analytics, verification queue, users, donations, campaigns, roles, audit log) |
| `styles.css` | design system, light + dark themes |
| `app.js` | all logic — auth, log flow, maps, currency, badges, quiz… |
| `js/upload-queue.js` | durable background uploads for proof photos |
| `js/idb.js` | tiny IndexedDB promise wrapper |
| `supabase-setup.sql` | one-time database setup — **run this first** |

`app.js` loads as an ES module (`<script type="module">`), so it must be served
over http — see step 2. Still no build step.

## The before photo can't be lost

Logging an action isn't one moment: you shoot **before**, then spend twenty
minutes actually planting or clearing, then shoot **after**. In between, the tab
gets backgrounded, the phone sleeps, the browser evicts the page, the wifi drops.

So the moment you pick the before photo it is written to **IndexedDB** and queued
for upload. From then on:

- the upload runs on its own — you can leave the log screen, it keeps going;
- a refresh, a crash or a closed tab doesn't lose it — the draft (photo, GPS,
  species, weight) is restored on your next visit;
- a failed upload retries automatically with backoff, and immediately when the
  device comes back online;
- the **after** slot stays locked until the before photo is durably stored.

One honest limit: a web page can't transfer bytes while it is fully closed —
that needs a native app, or Background Sync (which iOS doesn't support). What
this guarantees is that the bytes are never lost, and the transfer resumes the
moment the page is alive again.

## Setup (≈5 minutes)

### 1 · Create the database tables
1. Open your Supabase project → **SQL Editor** → **New query**
2. Paste the entire contents of `supabase-setup.sql` → **Run**

This creates the `profiles`, `actions`, `donations`, `teams`, `campaigns`,
`user_roles` and `audit_log` tables, row-level-security policies, private-schema
RBAC helper functions, the signup trigger (auto-creates a profile with the chosen
username), two public storage buckets (`proofs`, `avatars`), and turns on realtime
for the world map and donation ticker. Safe to re-run.

> Until you run it, the app still works fully in **demo mode** and shows a small
> reminder banner.

### 1b · Make yourself a super admin (for the admin console)
The admin console at `admin.html` is locked to users with a staff role. Bootstrap
the first one manually:
1. Sign up in the app first (so your `profiles` row exists).
2. Supabase Dashboard → **Authentication → Users** → copy your user's **UID**.
3. **SQL Editor** → run (paste your UID):
   ```sql
   insert into public.user_roles (user_id, role)
   values ('PASTE-YOUR-AUTH-UID-HERE', 'super_admin') on conflict do nothing;
   ```
4. Open `admin.html`, sign in — you can now promote other **admins** and
   **moderators** from the *Admins & roles* tab (no more SQL needed).

Roles: **super admin** (everything, incl. roles & settings) → **admin** (verify,
users, donations, campaigns) → **moderator** (review & verify submissions only).

### 2 · Serve the app over http
Auth (especially Google) won't work from a `file://` double-click. From this folder run **one** of:

```
npx serve .              # node
python -m http.server    # python
```

…or use the VS Code **Live Server** extension. Then open the printed URL
(e.g. `http://localhost:3000`).

### 3 · Tell Supabase where the app lives
Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: your app URL (e.g. `http://localhost:3000` while developing)
- **Redirect URLs**: add the same URL (and your hosted URL when you deploy)

You already enabled Email + Google providers — nothing else needed for email.
For Google, also make sure the Google Cloud OAuth client lists
`https://yosewbyorrtwjycbhhwq.supabase.co/auth/v1/callback` as a redirect URI
(Supabase shows this string on the Google provider page).

### 4 · (Optional) add a Google Maps key
The world map works **out of the box with keyless OpenStreetMap** — no key
needed, nothing to leak. Google Maps is optional and off by default.

If you want the Google basemap, set the key at runtime in `index.html`:

```html
<script>window.GREENUP_CONFIG = { mapsKey: "YOUR_KEY" };</script>
```

A Maps **browser** key is always visible to the client (it can't be hidden on a
static site), so the protection is *restriction*, not secrecy. In Google Cloud
Console → Credentials → your key:
- **Application restrictions → Websites** → add only your real domain (e.g.
  `https://deneal2005.github.io/*`) and `localhost:*` for dev
- **API restrictions** → only **Maps JavaScript API** + **Geocoding API**
- Set a **billing quota cap** so a stray key can't run up a bill

> The Supabase **publishable** key in `app.js` is safe to expose — access is
> enforced by row-level security. Never put a `service_role` key in this project.

> ⚠️ **If a Maps key ever lands in git** (it was, historically), treat it as
> compromised: **regenerate it** in Google Cloud Console, restrict the new one as
> above, and mark the GitHub secret-scanning alert as *revoked*. Removing it from
> the current code doesn't scrub it from git history — rotation is the real fix.

## How points work

| Action | Points |
|---|---|
| Plant a tree (before/after + GPS) | +10 |
| Clean-up (before/after + GPS) | +8, plus +1 per 2 kg (max +10) |
| Daily quiz | +5 |

Both action types require a **before + after photo pair** — the comparison slider
is the verification. Actions can be credited to a **team** (Teams tab: create,
search, join; each team has a dashboard with members, pooled stats and
achievements). Your last-used team stays selected for future submissions.

Levels: 🌱 Seed → 🌿 Sprout (50) → 🌳 Tree (150) → 🌲 Forest Guardian (400).
There are **27 badges** across five rarities (Common → Mythic) — hover or tap any
badge for its description, rarity and live progress. CO₂ math: 21 kg/year per tree.

### Moderation
Submissions go live and count immediately (**post-moderation**). Staff review them
in the admin **Verification queue** — *Approve* keeps a submission (stamps it
reviewed), *Reject* hides it from the map and can reverse the points. The world
map and activity feed only show `approved` actions.

## Troubleshooting

- **Yellow “one step left” banner** → step 1 hasn't been run yet (re-run it after
  updates too — it's idempotent and adds new tables like `teams`).
- **Google login bounces back unauthenticated** → step 3 URLs don't match the
  address in your browser bar.
- **Map shows “Oops! Something went wrong” / falls back to OpenStreetMap** →
  in Google Cloud Console enable **Maps JavaScript API** (and **Geocoding API**)
  under APIs & Services → Library, and make sure **billing is linked** to the
  project. “Google Maps API” is not one switch — the JavaScript one specifically
  must be on. The app auto-falls back to OpenStreetMap so nothing breaks while
  you fix it; it uses Google again on the next visit once the key works.
- **“username is taken”** → it is. Usernames are unique across the grove.

## Honest footnotes

- Verification is **human** (the admin queue), not automatic — there's no EXIF /
  duplicate ML check yet. Wire one to an edge function when you're ready.
- Donation checkout is simulated (no payment processor). The `donations` table
  records intent (with a currency-normalised `amount_inr`) so the transparency
  dashboard and admin analytics work against real data.
- Currency conversion uses static approximate rates defined in `app.js`
  (`CURRENCIES`) — swap in a live FX API if precision starts to matter.
- Ban/flag are moderation flags on the profile; deleting an auth account still
  needs the Supabase dashboard (the client can't use a `service_role` key).
- The admin dashboard loads **Chart.js** from a CDN for its graphs; everything
  else stays dependency-free.
