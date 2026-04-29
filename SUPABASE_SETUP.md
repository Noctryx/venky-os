# Supabase Setup Guide for Venky's OS

This guide walks you through setting up Supabase for cross-device sync functionality.

## Overview

Supabase provides:
- **Authentication**: Magic link sign-in (no passwords)
- **Database**: Cloud storage for your tasks, schedules, and completion marks
- **Sync**: Automatic data sync across devices

## Prerequisites

- A Supabase account (free tier is sufficient)
- Your deployed app URL: `https://noctryx.github.io/venky-os/`
- For local testing: `http://localhost:5000/`

---

## Complete Setup Steps

### 1. Create a Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Sign in or create an account
4. Fill in the project form:
   - **Project name**: `venky-os` (any name works)
   - **Database password**: Create a strong password (save this!)
   - **Region**: Select the closest region to you
5. Click **"Create new project"** and wait ~3 minutes for initialization

### 2. Set Up the Database Schema

1. In your Supabase dashboard, navigate to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Paste the following SQL:

```sql
-- Create user_data table
create table user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  entries text default '[]',
  done_marks text default '{}',
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table user_data enable row level security;

-- Create RLS policy: Users can only access their own data
create policy "Users can manage own data"
on user_data for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create trigger to auto-update timestamp on changes
create or replace function update_user_data_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_data_timestamp
  before update on user_data
  for each row
  execute function update_user_data_timestamp();
```

4. Click **"Run"** to execute the schema

### 3. Retrieve Your API Credentials

1. Go to **Project Settings** (bottom of left sidebar)
2. Select **API** tab
3. Copy these values and save them somewhere safe:
   - **Project URL**: Looks like `https://xxxxx.supabase.co`
   - **Project API Key (anon public)**: Under "Project API keys" section

⚠️ **Keep these credentials private** — the anon key is public-facing but should not be shared widely.

### 4. Configure Authentication URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration** (left sidebar)
2. Set **Site URL** to:
   ```
   https://noctryx.github.io/venky-os/
   ```
3. Add **Redirect URLs**:
   - `https://noctryx.github.io/venky-os/`
   - `http://localhost:5000/` (for local development)
4. Click **"Save"**

### 5. Update the App Configuration

1. Open `index.html` in your editor
2. Find the `CONFIG` object (around line 3473)
3. Replace the placeholders with your Supabase credentials:

```javascript
const CONFIG = {
  SUPABASE_URL: "https://your-project-id.supabase.co",
  SUPABASE_ANON: "your-anon-key-here",
  EMAIL_REDIRECT: "https://noctryx.github.io/venky-os/",
};
```

4. Save the file

### 6. Deploy Changes

```bash
# Commit the configuration update
git add index.html
git commit -m "Enable Supabase sync with credentials"

# Push to GitHub (changes go live within minutes)
git push origin main
```

---

## Testing the Setup

### Live Deployment Test

1. Open https://noctryx.github.io/venky-os/
2. Navigate to **Settings** tab (gear icon)
3. Click **"Sign in"**
4. Enter your email address and click **"Send magic link"**
5. Check your email inbox and click the magic link
6. You're now signed in!
7. Create some tasks and mark them complete
8. On another device, sign in with the same email to see synced data

### Local Testing (Before Deployment)

If you want to test locally first:

1. Update `CONFIG` in your local `index.html`
2. Run: `npx serve .`
3. Open http://localhost:5000/
4. Test the sign-in flow (redirects back to localhost)

---

## How the Sync Works

When you're signed in:
- **Automatic upload**: Your tasks sync to Supabase every minute
- **Automatic download**: Changes from other devices appear within 1 minute
- **Offline support**: Works fully offline; syncs when connection returns
- **Data structure**:
  - `entries`: Array of task objects (title, area, schedule, etc.)
  - `done_marks`: Object tracking which tasks you marked as done

---

## Troubleshooting

### "Invalid API key" or "401 Unauthorized"
- Check that you copied the **anon public key**, not the service role key
- Verify the URL has no extra spaces or special characters
- Clear browser cache and retry

### "Redirect mismatch" when signing in
- Verify your email and Supabase redirect URLs match exactly
- For live site: must be `https://noctryx.github.io/venky-os/`
- For localhost: must be `http://localhost:5000/`

### Sign-in email doesn't arrive
- Check spam/junk folder
- Supabase free tier may have rate limits; wait a few minutes and retry
- Verify the email address was typed correctly

### Data not syncing across devices
- Ensure both devices are signed in with the same email
- Check that you waited at least 1 minute after marking tasks
- Verify both devices have an active internet connection

### "Table doesn't exist" error
- Confirm you ran the SQL schema in the SQL Editor (not in the SQL templates)
- Wait 1-2 minutes after creating the table for it to be available

---

## API Endpoint Reference

For developers wanting to manually call the Supabase API:

- **Base URL**: `https://YOUR_PROJECT_URL/rest/v1`
- **User data retrieval**: `GET /user_data?user_id=eq.{user_id}`
- **Update data**: `PATCH /user_data` with JSON body
- **Auth**: Include header `Authorization: Bearer {access_token}`

---

## Security Notes

- The `anon key` is designed to be public — it's restricted by Row Level Security policies
- Users can only access their own data via RLS policies
- Never commit real credentials to public repositories; this guide recommends updating before deployment
- The `supabase.min.js` bundle is self-hosted and loaded only when needed

---

## Next Steps

1. Follow the setup steps above
2. Test sign-in and data sync
3. Install the app on your phone (Android) or desktop (Chrome)
4. Use the magic link to stay synced across devices!

For more help, see [Supabase docs](https://supabase.com/docs).
