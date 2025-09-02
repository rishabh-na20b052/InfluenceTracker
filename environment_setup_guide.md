# Environment Variables Setup Guide

## Required Environment Variables for KPI Updater Function

### 1. Twitter API (X_BEARER_TOKEN)

**Location:** Supabase Dashboard → Project Settings → API → Secrets

**How to get it:**

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create an app or use existing one
3. Navigate to **Keys and Tokens** tab
4. Copy the **Bearer Token**
5. Set as: `X_BEARER_TOKEN = "your-bearer-token-here"`

### 2. YouTube API (YOUTUBE_API_KEY)

**Location:** Supabase Dashboard → Project Settings → API → Secrets

**How to get it:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Set as: `YOUTUBE_API_KEY = "your-api-key-here"`

### 3. Apify API (APIFY_API_TOKEN)

**Location:** Supabase Dashboard → Project Settings → API → Secrets

**How to get it:**

1. Go to [Apify Console](https://console.apify.com/)
2. Go to Settings → API & Integrations
3. Copy your API token
4. Set as: `APIFY_API_TOKEN = "your-apify-token-here"`

### 4. Instagram Session (INSTAGRAM_SESSION_ID)

**Location:** Supabase Dashboard → Project Settings → API → Secrets

**How to get it:**

1. Log into Instagram in a browser
2. Open Developer Tools → Application → Cookies
3. Find the `sessionid` cookie value
4. Set as: `INSTAGRAM_SESSION_ID = "your-session-id-here"`

## Verification Steps

1. **Check Secrets in Supabase:**

   - Go to Dashboard → Settings → API → Secrets
   - Ensure all 4 variables are set

2. **Test the Function:**

   ```bash
   # Test manually
   curl -X POST "https://qruqdkpnqwkgjrvavaro.supabase.co/functions/v1/kpi-updater" \
     -H "Authorization: Bearer sbp_b100ca79cf3e87472f9912753e71c4e4510270ce" \
     -H "Content-Type: application/json"
   ```

3. **Check Function Logs:**
   - Go to Supabase Dashboard → Edge Functions → kpi-updater
   - View logs to see if API calls are successful

## Expected Behavior After Setup

- **Twitter Posts:** Will fetch real metrics (views, likes, comments, shares)
- **YouTube Posts:** Will fetch real metrics (views, likes, comments)
- **Instagram Posts:** Will fetch real metrics (views, likes, comments)
- **Cron Job:** Will update all posts hourly with real data
