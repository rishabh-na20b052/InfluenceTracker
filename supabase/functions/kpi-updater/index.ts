/// <reference lib="deno.ns" />

// File: supabase/functions/kpi-updater/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// --- THIS IS THE CORRECTED LINE ---
// The 'npm:' specifier is the most reliable way to import modules in Supabase Functions.
// This resolves the "worker boot error" that occurs during scheduled runs.
import { ApifyClient } from "npm:apify-client@2.9";

// Types for better type safety
interface PostMetrics {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

interface Post {
  id: string;
  post_url: string;
  platform: "youtube" | "x" | "instagram";
}

// Main handler for the Supabase Edge Function
Deno.serve(async (_req: Request) => {
  try {
    // Initialize the Admin Supabase client to bypass RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Missing required environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // 1. Fetch all posts from the database.
    const { data: posts, error: fetchError } = await supabaseAdmin
      .from("posts")
      .select("id, post_url, platform");

    if (fetchError)
      throw new Error(`Supabase fetch error: ${fetchError.message}`);
    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No posts found to update." }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${posts.length} posts to update.`);

    // 2. Process each post to fetch new metrics in parallel.
    const updatePromises = posts.map(async (post: Post) => {
      try {
        let metrics: PostMetrics | null = null;

        switch (post.platform) {
          case "youtube":
            metrics = await getYoutubeMetrics(post.post_url);
            break;
          case "x":
            metrics = await getXMetrics(post.post_url);
            break;
          case "instagram":
            metrics = await getInstagramMetrics(post.post_url);
            break;
          default:
            console.warn(
              `Unsupported platform for post ${post.id}: ${post.platform}`
            );
            return; // Skip this post
        }

        // 3. Update the post in the database with the new metrics.
        if (metrics && Object.keys(metrics).length > 0) {
          const { error: updateError } = await supabaseAdmin
            .from("posts")
            .update({ ...metrics, last_updated: new Date().toISOString() })
            .eq("id", post.id);

          if (updateError) {
            throw new Error(
              `Failed to update DB for post ${post.id}: ${updateError.message}`
            );
          }
          console.log(`Successfully updated post: ${post.id}`);
        }
      } catch (error) {
        // Log an error for a single failed post but don't stop the whole process.
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          `Skipping post ${post.id} (${post.post_url}) due to error:`,
          errorMessage
        );
      }
    });

    // Wait for all update operations to complete.
    await Promise.all(updatePromises);

    return new Response(
      JSON.stringify({
        message: `Update process completed for ${posts.length} posts.`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("A fatal error occurred:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// --- Platform-Specific Data Fetching Logic (No changes made here) ---

async function getYoutubeMetrics(url: string): Promise<PostMetrics> {
  try {
    const videoIdMatch = url.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
    if (!videoIdMatch) {
      console.warn("Invalid YouTube URL format, using fallback metrics");
      return { views: 0, likes: 0, comments: 0 };
    }

    const videoId = videoIdMatch[1];
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

    if (!YOUTUBE_API_KEY) {
      console.warn("YOUTUBE_API_KEY not set, using fallback metrics");
      return { views: 0, likes: 0, comments: 0 };
    }

    const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`;
    const response = await fetch(endpoint);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`YouTube API Error: ${errorText}, using fallback metrics`);
      return { views: 0, likes: 0, comments: 0 };
    }

    const result = await response.json();
    const video = result.items?.[0];

    if (!video) {
      console.warn("YouTube video not found, using fallback metrics");
      return { views: 0, likes: 0, comments: 0 };
    }

    return {
      views: parseInt(video.statistics?.viewCount || "0", 10) || 0,
      likes: parseInt(video.statistics?.likeCount || "0", 10) || 0,
      comments: parseInt(video.statistics?.commentCount || "0", 10) || 0,
    };
  } catch (error) {
    console.warn(
      "YouTube metrics fetch failed, using fallback:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return { views: 0, likes: 0, comments: 0 };
  }
}

async function getXMetrics(url: string): Promise<PostMetrics> {
  try {
    console.log(`Fetching Twitter metrics for URL: ${url}`);

    const tweetIdMatch = url.match(/\/status\/(\d+)/);
    if (!tweetIdMatch) {
      console.warn("Invalid X/Twitter URL format, using fallback metrics");
      return { views: 0, likes: 0, comments: 0, shares: 0 };
    }

    const tweetId = tweetIdMatch[1];
    console.log(`Extracted tweet ID: ${tweetId}`);

    const X_BEARER_TOKEN = Deno.env.get("X_BEARER_TOKEN");

    if (!X_BEARER_TOKEN) {
      console.warn("X_BEARER_TOKEN not set, using fallback metrics");
      return { views: 0, likes: 0, comments: 0, shares: 0 };
    }

    // Updated endpoint with proper fields
    const endpoint = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics,created_at,author_id&expansions=author_id&user.fields=username`;
    console.log(`Making API call to: ${endpoint}`);

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${X_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`Twitter API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Twitter API error response: ${errorText}`);

      // Enhanced rate limit detection
      if (
        response.status === 429 ||
        errorText.includes("rate limit") ||
        errorText.includes("Too Many Requests") ||
        errorText.includes("Rate limit exceeded")
      ) {
        console.warn(
          `Twitter API rate limit reached, skipping update for this post`
        );
        return { views: 0, likes: 0, comments: 0, shares: 0 };
      }

      // Handle authentication errors
      if (response.status === 401 || errorText.includes("Unauthorized")) {
        console.error(
          "Twitter API authentication failed - check X_BEARER_TOKEN"
        );
      }

      console.warn(
        `X API Error (${response.status}): ${errorText}, using fallback metrics`
      );
      return { views: 0, likes: 0, comments: 0, shares: 0 };
    }

    const result = await response.json();
    console.log("Twitter API response data:", JSON.stringify(result, null, 2));

    if (!result.data) {
      console.warn(
        "Could not find data for this tweet, using fallback metrics"
      );
      return { views: 0, likes: 0, comments: 0, shares: 0 };
    }

    const metrics = result.data.public_metrics || {};
    console.log("Twitter metrics:", metrics);

    // Twitter API v2 may not always provide impression_count
    // Use alternative metrics if available
    const views = metrics.impression_count || metrics.retweet_count || 0;

    const result_metrics = {
      views: Number(views) || 0,
      likes: Number(metrics.like_count) || 0,
      comments: Number(metrics.reply_count) || 0,
      shares:
        (Number(metrics.retweet_count) || 0) +
        (Number(metrics.quote_count) || 0),
    };

    console.log("Final Twitter metrics for post:", result_metrics);
    return result_metrics;
  } catch (error) {
    console.error(
      "X/Twitter metrics fetch failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return { views: 0, likes: 0, comments: 0, shares: 0 };
  }
}

async function getInstagramMetrics(url: string): Promise<PostMetrics> {
  try {
    const APIFY_API_TOKEN = Deno.env.get("APIFY_API_TOKEN");
    const INSTAGRAM_SESSION_ID = Deno.env.get("INSTAGRAM_SESSION_ID");

    if (!APIFY_API_TOKEN || !INSTAGRAM_SESSION_ID) {
      console.warn(
        "APIFY_API_TOKEN or INSTAGRAM_SESSION_ID not set, using fallback metrics"
      );
      return { views: 0, likes: 0, comments: 0 };
    }

    const client = new ApifyClient({ token: APIFY_API_TOKEN });
    const runInput = {
      directUrls: [url],
      resultsLimit: 1,
      sessionConfig: {
        sessionCookies: [{ name: "sessionid", value: INSTAGRAM_SESSION_ID }],
      },
    };

    const run = await client.actor("apify/instagram-scraper").call(runInput);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!items || items.length === 0) {
      console.warn(
        "Apify did not return any data for this Instagram URL, using fallback metrics"
      );
      return { views: 0, likes: 0, comments: 0 };
    }

    const post = items[0];
    return {
      views: Number(post.playCount || post.videoViewCount || 0),
      likes: Number(post.likesCount || 0),
      comments: Number(post.commentsCount || 0),
    };
  } catch (error) {
    console.warn(
      "Instagram metrics fetch failed, using fallback:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return { views: 0, likes: 0, comments: 0 };
  }
}
