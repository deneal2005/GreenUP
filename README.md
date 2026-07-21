# 🌱 GreenUp — Plant. Clean. Grow.

A student sustainability tracker: log trees and clean-ups with **photo + GPS proof**,
watch them appear on a live **world map**, climb the leaderboardgit. 
Built with plain HTML/CSS/JS + Supabase for database + Google Maps — no
build step, no framework.

## Filesclear


| File | What it is |
|---|---|
| `index.html` | the app (open this) |
| `styles.css` | design system, light + dark themes |
| `app.js` | all logic — auth, log flow, maps, currency, quiz… |
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

This creates the `profiles`, `actions` and `donations` tables, row-level-security
policies, the signup trigger (auto-creates a profile with the chosen username),
two public storage buckets (`proofs`, `avatars`), and turns on realtime for the
world map. Safe to re-run.

> Until you run it, the app still works fully in **demo mode** and shows a small
> reminder banner.

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

### 4 · Lock down the Google Maps key (important)
The Maps key ships in client code by design, but restrict it so nobody else can
bill you: Google Cloud Console → Credentials → your key →
**Application restrictions → Websites** → add `localhost:*` and your real domain.
Keep only **Maps JavaScript API** + **Geocoding API** enabled for it.

> The Supabase **publishable** key is safe to expose. Never put a
> `service_role` key in this project.

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
CO₂ math: 21 kg/year per mature tree.

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

- “EXIF check” and “duplicate check” in the verification preview are simulated —
  wire them to an edge function when you're ready for real moderation.
- Donation checkout is simulated (no payment processor). The `donations` table
  records intent so the transparency dashboard works.
- Currency conversion uses static approximate rates defined in `app.js`
  (`CURRENCIES`) — swap in a live FX API if precision starts to matter.
