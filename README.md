# Venky's OS

A personal life operating system for planning the day, tracking consistency, and keeping self, work, family, and friends in one place.

Live app: [noctryx.github.io/venky-os](https://noctryx.github.io/venky-os/)

## Overview

Venky's OS is a single-file progressive web app that replaces scattered notes, reminders, and mental overhead with one focused dashboard. It helps you plan what matters, mark progress as you go, and review how consistently you showed up over time.

The app is organized around four life areas:

- Self
- Work
- Family
- Friends

## What It Does

The interface is split into a few core views:

- Today: a session-based schedule for Morning, Afternoon, and Evening with a live completion score
- Week: a 7-day grid that shows balance across life areas
- Month: a calendar view with heat dots for scheduled days
- Areas: today's entries grouped by life area with time-spent totals
- Insights: consistency, completion, streaks, weekday patterns, and a 90-day heatmap

## Features

- One-tap completion tracking for entries
- Repeat rules for daily, weekdays, weekends, weekly, monthly, or custom days
- Browser notifications with configurable lead times of 5, 10, 15, or 30 minutes
- Supabase sync with magic-link sign-in and no password flow
- CSV export for all data
- Installable PWA support on Android and desktop browsers
- Optional skipping of Indian public holidays for repeating entries
- Offline-first behavior with localStorage and sync when online

## Tech Stack

| Layer       | Tool                                  |
| ----------- | ------------------------------------- |
| Frontend    | Vanilla HTML, CSS, and JavaScript     |
| Charts      | Chart.js 4.4                          |
| Auth and DB | Supabase magic-link auth + PostgreSQL |
| Hosting     | GitHub Pages                          |
| Offline     | Service Worker + Cache API            |
| Fonts       | DM Sans + DM Mono                     |

There is no build step. No npm install is required for the app itself. Open `index.html` and it runs.

## Project Structure

```
venky-os/
├── index.html
├── manifest.json
├── sw.js
├── chart.umd.min.js
├── supabase.min.js
├── __style.css
├── __style.min.css
├── fonts/
├── icon-192.png
├── icon-512.png
└── README.md
```

## Run Locally

Open `index.html` directly for a quick preview. To test the service worker, PWA install flow, and other browser features, serve the folder from `localhost` or another HTTP server.

Example:

```bash
git clone https://github.com/Noctryx/venky-os.git
cd venky-os
npx serve .
```

## Supabase Sync Setup

To enable cross-device sync, create a Supabase project and add the following table and policy:

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

Then:

1. Copy your Project URL and anon key from Supabase → Project Settings → API
2. Update the Supabase config in `index.html`

```js
const CONFIG = {
  SUPABASE_URL: "YOUR_SUPABASE_URL",
  SUPABASE_ANON: "YOUR_SUPABASE_ANON_KEY",
  EMAIL_REDIRECT: "https://your-hosting-url/",
};
```

3. Set the Site URL and Redirect URL in Supabase → Authentication → URL Configuration to your deployed app URL
4. Redeploy and sign in with the magic link flow

## Install As An App

On Android in Chrome, open the live app and use Add to Home screen from the menu. On desktop Chrome, open the live app and use the Install button in the address bar.

## License

MIT. Use it, fork it, and adapt it to your own system.
