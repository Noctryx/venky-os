# Venky's OS 🟢

A personal life operating system — built to track, reflect on, and improve every area of daily life.

**Live app → [noctryx.github.io/venky-os](https://noctryx.github.io/venky-os/)**

---

## What it does

Venky's OS is a single-file progressive web app that replaces scattered notes, phone reminders, and mental overhead with one clean system. It covers four life areas — **Self, Work, Family, Friends** — and shows you how consistently you're showing up across all of them.

### Views
- **Today** — session-based daily schedule (Morning / Afternoon / Evening) with a live completion score
- **Week** — 7-day grid with area balance bars showing where your attention went
- **Month** — calendar heat-dots for every scheduled day
- **Areas** — today's entries grouped by life area with time-spent totals
- **Insights** — consistency %, completion %, streaks, day-of-week patterns, 90-day heatmap

### Features
- ✅ Mark entries as done with a single tap
- 🔁 Repeat rules — daily, weekdays, weekends, weekly, monthly, or custom days
- 🔔 Browser notifications with configurable lead time (5/10/15/30 min)
- ☁️ Cross-device sync via Supabase (magic link auth, no password needed)
- 📥 Export all data as CSV
- 📱 Installable as a PWA on Android and desktop (Chrome)
- 🇮🇳 Skip Indian public holidays option on repeating entries
- 💾 Works fully offline — data lives in localStorage, syncs when online

---

## Tech stack

| Layer | Tool |
|---|---|
| Frontend | Vanilla HTML/CSS/JS — no framework |
| Charts | Chart.js 4.4 |
| Auth + DB | Supabase (magic link OTP + PostgreSQL) |
| Hosting | GitHub Pages |
| Offline | Service Worker + Cache API |
| Fonts | DM Sans + DM Mono (Google Fonts) |

No build step. No npm. No node_modules. Open `index.html` and it runs.

---

## Project structure

```
venky-os/
├── index.html      ← entire app (UI + logic + styles)
├── manifest.json   ← PWA install config
├── sw.js           ← service worker for offline support
├── icon-192.png    ← app icon
└── icon-512.png    ← app icon (large)
```

---

## Running locally

No setup needed — just open the file:

```bash
git clone https://github.com/Noctryx/venky-os.git
cd venky-os
# open index.html in any browser
```

For sync to work across devices, you need a Supabase project (see below).

---

## Setting up Supabase sync

1. Create a free project at [supabase.com](https://supabase.com)
2. Run this SQL in the **SQL Editor**:

```sql
create table user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  entries text default '[]',
  done_marks text default '{}',
  updated_at timestamptz default now()
);

alter table user_data enable row level security;

create policy "Users can manage own data"
on user_data for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

3. Go to **Project Settings → API** and copy your Project URL and anon key
4. In `index.html`, replace:

```js
const SUPABASE_URL  = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY';
```

5. In Supabase → **Authentication → URL Configuration**, set both Site URL and Redirect URL to your GitHub Pages URL
6. Redeploy — sign in with any email, click the magic link, synced

---

## Installing as an app

**Android (Chrome):**
1. Open the live URL in Chrome
2. Tap ⋮ menu → Add to Home screen

**Desktop (Chrome):**
1. Open the live URL
2. Click the ⊕ icon in the address bar → Install

---

## Background

Built as a personal tool to track a structured daily routine across college, self-development (Web Dev + GSoC prep), and personal life. Designed to give an honest picture of consistency over time — not just what was planned, but what was actually done.

---

## License

MIT — use it, fork it, make it yours.
