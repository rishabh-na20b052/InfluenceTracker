// app/api/posts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import { getUserId } from "@/lib/auth";

// Helper to determine platform from URL
function getPlatformFromUrl(
  url: string,
): "instagram" | "youtube" | "x" | "unknown" {
  if (url.match(/instagram\.com\/(p|reel)\//)) return "instagram";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("x.com") || url.includes("twitter.com")) return "x";
  return "unknown";
}

// Helper to fetch metadata from APIs
async function fetchPostMetadata(url: string, platform: string) {
  const metadata: any = {
    username: null,
    thumbnail_url: null,
    posted_at: null,
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
  };

  try {
    switch (platform) {
      case "youtube":
        const videoId = url.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        )?.[1];
        if (videoId && process.env.YOUTUBE_API_KEY) {
          const ytResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${process.env.YOUTUBE_API_KEY}`,
          );
          if (ytResponse.ok) {
            const ytData = await ytResponse.json();
            if (ytData.items?.[0]) {
              const item = ytData.items[0];
              metadata.username = item.snippet?.channelTitle || "Unknown";
              metadata.thumbnail_url = item.snippet?.thumbnails?.high?.url ||
                null;
              metadata.posted_at = item.snippet?.publishedAt || null;
              metadata.views = Number(item.statistics?.viewCount || 0);
              metadata.likes = Number(item.statistics?.likeCount || 0);
              metadata.comments = Number(item.statistics?.commentCount || 0);
            }
          }
        }
        break;

      case "x":
        if (process.env.X_BEARER_TOKEN) {
          const tweetId = url.match(/\/status\/(\d+)/)?.[1];
          if (tweetId) {
            const xResponse = await fetch(
              `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=created_at,public_metrics,attachments&expansions=attachments.media_keys,author_id&media.fields=url,preview_image_url,type&user.fields=profile_image_url`,
              {
                headers: {
                  Authorization: `Bearer ${process.env.X_BEARER_TOKEN}`,
                },
              },
            );
            if (xResponse.ok) {
              const xData = await xResponse.json();
              if (xData.data) {
                metadata.posted_at = xData.data.created_at;
                metadata.likes = Number(
                  xData.data.public_metrics?.like_count || 0,
                );
                metadata.comments = Number(
                  xData.data.public_metrics?.reply_count || 0,
                );
                metadata.shares = Number(
                  xData.data.public_metrics?.retweet_count || 0,
                );
                metadata.views = Number(
                  xData.data.public_metrics?.impression_count || 0,
                );

                // Get user info
                if (xData.includes?.users?.[0]) {
                  metadata.username = xData.includes.users[0].username;
                  metadata.thumbnail_url =
                    xData.includes.users[0].profile_image_url;
                }

                // Enhanced media handling for videos and images
                if (xData.includes?.media?.[0]) {
                  const media = xData.includes.media[0];

                  // For videos, use preview_image_url if available
                  if (media.type === "video" && media.preview_image_url) {
                    metadata.thumbnail_url = media.preview_image_url;
                  } // For photos, use the regular url
                  else if (media.type === "photo" && media.url) {
                    metadata.thumbnail_url = media.url;
                  } // Fallback to any available media URL
                  else if (media.url) {
                    metadata.thumbnail_url = media.url;
                  }
                }
              }
            }
          }
        }
        break;

      case "instagram":
        console.log("Processing Instagram URL:", url);

        if (!process.env.APIFY_API_TOKEN) {
          console.log("APIFY_API_TOKEN not configured, using fallback data");
          const postId = url.match(/\/p\/([^\/]+)/)?.[1];
          metadata.username = "Instagram User";
          metadata.thumbnail_url = postId
            ? `https://instagram.com/p/${postId}/media/?size=m`
            : null;
          metadata.likes = 0;
          metadata.comments = 0;
          metadata.views = 0;
          break;
        }

        if (!process.env.INSTAGRAM_SESSION_ID) {
          console.log(
            "INSTAGRAM_SESSION_ID not configured, using fallback data",
          );
          const postId = url.match(/\/p\/([^\/]+)/)?.[1];
          metadata.username = "Instagram User";
          metadata.thumbnail_url = postId
            ? `https://instagram.com/p/${postId}/media/?size=m`
            : null;
          metadata.likes = 0;
          metadata.comments = 0;
          metadata.views = 0;
          break;
        }

        try {
          console.log("Calling Apify Instagram scraper with ApifyClient...");

          // Use the exact same logic as your working code
          const client = new ApifyClient({
            token: process.env.APIFY_API_TOKEN,
          });
          const runInput = {
            directUrls: [url],
            resultsLimit: 1,
            sessionConfig: {
              sessionCookies: [{
                name: "sessionid",
                value: process.env.INSTAGRAM_SESSION_ID,
              }],
            },
            proxyConfig: { useApifyProxy: true },
          };

          const run = await client.actor("apify/instagram-scraper").call(
            runInput,
          );
          const items = await client.dataset(run.defaultDatasetId).listItems();

          console.log(
            "Instagram scraper items:",
            JSON.stringify(items, null, 2),
          );

          if (!items?.items?.length) {
            console.log("No Instagram data returned, using fallback");
            const postId = url.match(/\/p\/([^\/]+)/)?.[1];
            metadata.username = "Instagram User";
            metadata.thumbnail_url = postId
              ? `https://instagram.com/p/${postId}/media/?size=m`
              : null;
            metadata.likes = 0;
            metadata.comments = 0;
            metadata.views = 0;
            break;
          }

          const scrapedData = items.items[0];

          // Map the response fields to our metadata (exact same as your working code)
          metadata.username = scrapedData.ownerUsername ||
            scrapedData.ownerFullName || scrapedData.username ||
            "Instagram User";
          metadata.thumbnail_url = scrapedData.displayUrl ||
            scrapedData.thumbnailUrl ||
            (scrapedData.images && Array.isArray(scrapedData.images) &&
              scrapedData.images[0]) ||
            null;
          metadata.posted_at = scrapedData.timestamp || scrapedData.takenAt ||
            scrapedData.createdAt || null;
          metadata.likes = Number(scrapedData.likesCount || 0);
          metadata.comments = Number(scrapedData.commentsCount || 0);
          metadata.views = Number(
            scrapedData.playCount || scrapedData.videoPlayCount ||
              scrapedData.videoViewCount || 0,
          );

          console.log("Successfully extracted Instagram metadata:", metadata);
        } catch (error) {
          console.error("Instagram scraper request failed:", error);
          const postId = url.match(/\/p\/([^\/]+)/)?.[1];
          metadata.username = "Instagram User";
          metadata.thumbnail_url = postId
            ? `https://instagram.com/p/${postId}/media/?size=m`
            : null;
          metadata.likes = 0;
          metadata.comments = 0;
          metadata.views = 0;
        }
        break;
    }
  } catch (error) {
    console.error(`Error fetching metadata for ${platform}:`, error);
  }

  return metadata;
}

export async function POST(request: NextRequest) {
  // Get authenticated user
  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  const { campaignId, postUrl } = await request.json();

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Supabase environment variables are not configured" },
      { status: 500 },
    );
  }

  // Validate input
  if (!campaignId || !postUrl) {
    return NextResponse.json({
      error: "Campaign ID and Post URL are required.",
    }, { status: 400 });
  }

  const platform = getPlatformFromUrl(postUrl);
  if (platform === "unknown") {
    return NextResponse.json({
      error: "The URL is not a valid Instagram, X, or YouTube post link.",
    }, { status: 400 });
  }

  try {
    // Check if campaign exists (company-wide access)
    const campaignCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/campaigns?id=eq.${campaignId}&select=id`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!campaignCheck.ok) {
      return NextResponse.json({ error: "Campaign not found." }, {
        status: 404,
      });
    }

    const campaigns = await campaignCheck.json();
    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        error: "Campaign not found or access denied.",
      }, {
        status: 404,
      });
    }

    // Fetch metadata from the platform
    const metadata = await fetchPostMetadata(postUrl, platform);

    // Insert the new post with metadata
    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({
        campaign_id: campaignId,
        post_url: postUrl,
        platform: platform,
        username: metadata.username,
        thumbnail_url: metadata.thumbnail_url,
        posted_at: metadata.posted_at,
        views: metadata.views,
        likes: metadata.likes,
        comments: metadata.comments,
        shares: metadata.shares,
      }),
    });

    if (!insertResponse.ok) {
      const errorData = await insertResponse.json();
      if (errorData.code === "23505") { // unique_violation for post_url
        return NextResponse.json({
          error: "This post URL has already been added to a campaign.",
        }, { status: 409 });
      }
      return NextResponse.json(
        { error: errorData.message || "Failed to create post" },
        { status: insertResponse.status },
      );
    }

    const newPost = await insertResponse.json();

    return NextResponse.json(newPost[0] || newPost, { status: 200 });
  } catch (error: any) {
    console.error("Error adding post:", error);
    return NextResponse.json({
      error: error.message || "An internal server error occurred.",
    }, { status: 500 });
  }
}
