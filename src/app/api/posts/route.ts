// app/api/posts/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase'; // Assuming you have Supabase types generated

<<<<<<< HEAD
// Helper to determine platform from URL
function getPlatformFromUrl(url: string): 'instagram' | 'youtube' | 'x' | 'unknown' {
    if (url.match(/instagram\.com\/(p|reel)\//)) return 'instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('x.com') || url.includes('twitter.com')) return 'x';
    return 'unknown';
=======
function detectPlatformFromUrl(postUrl: string): Platform | null {
  try {
    const url = new URL(postUrl);
    const host = url.hostname.toLowerCase();
    if (host.includes("youtu.be") || host.includes("youtube.com")) {
      return "youtube";
    }
    if (host.includes("instagram.com")) {
      return "instagram";
    }
    if (host.includes("twitter.com") || host.includes("x.com")) {
      return "x";
    }
    return null;
  } catch {
    return null;
  }
>>>>>>> fbb20c6 (Track Post and Share Campaign)
}

export async function POST(request: Request) {
  const { campaignId, postUrl } = await request.json();
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // 1. Check if a user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: You must be logged in.' }, { status: 401 });
  }

  // 2. Validate input
  if (!campaignId || !postUrl) {
    return NextResponse.json({ error: 'Campaign ID and Post URL are required.' }, { status: 400 });
  }

  const platform = getPlatformFromUrl(postUrl);
  if (platform === 'unknown') {
      return NextResponse.json({ error: 'The URL is not a valid Instagram, X, or YouTube post link.' }, { status: 400 });
  }

  try {
<<<<<<< HEAD
    // 3. [SECURITY CHECK] Verify the logged-in user owns the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('user_id')
      .eq('id', campaignId)
      .single();
      
    if (campaignError || !campaign) {
        return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    }
    
    if (campaign.user_id !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden: You do not have permission to add posts to this campaign.' }, { status: 403 });
    }
    
    // 4. If security check passes, insert the new post
    const { data: newPost, error: insertError } = await supabase
      .from('posts')
      .insert({
        campaign_id: campaignId,
        post_url: postUrl,
        platform: platform,
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') { // unique_violation for post_url
          return NextResponse.json({ error: 'This post URL has already been added to a campaign.' }, { status: 409 });
=======
    const { campaignId, postUrl } = (await req.json()) as {
      campaignId?: string;
      postUrl?: string;
    };

    if (!campaignId || !postUrl) {
      return new NextResponse(
        JSON.stringify({ error: "campaignId and postUrl are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const platform = detectPlatformFromUrl(postUrl);
    if (!platform) {
      return new NextResponse(
        JSON.stringify({ error: "Unsupported post URL/platform" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const SUPABASE_URL =
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const SERVICE_ROLE_KEY =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new NextResponse(
        JSON.stringify({
          error: "Supabase environment variables are not configured",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Enrich with real metadata
    let metadata: Record<string, any> = {};
    try {
      if (platform === "youtube") {
        const key = process.env.YOUTUBE_API_KEY;
        const idMatch = postUrl.match(
          /(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/
        );
        const vid = idMatch?.[1];
        if (key && vid) {
          const yt = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${vid}&key=${key}`
          );
          const res = await yt.json();
          const item = res.items?.[0];
          if (item) {
            metadata = {
              thumbnail_url:
                item.snippet?.thumbnails?.high?.url ||
                item.snippet?.thumbnails?.default?.url,
              username: item.snippet?.channelTitle || null,
              posted_at: item.snippet?.publishedAt || null,
              views: Number(item.statistics?.viewCount || 0),
              likes: Number(item.statistics?.likeCount || 0),
              comments: Number(item.statistics?.commentCount || 0),
            };
          }
        }
      } else if (platform === "x") {
        const token = process.env.X_BEARER_TOKEN;
        const tweetId = postUrl.match(/\/status\/(\d+)/)?.[1];
        if (token && tweetId) {
          const tw = await fetch(
            `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics,created_at,attachments&expansions=author_id,attachments.media_keys&user.fields=username,profile_image_url&media.fields=url`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const res = await tw.json();
          const metrics = res.data?.public_metrics || {};
          const user = res.includes?.users?.[0];

          // Get thumbnail - prefer tweet media, fallback to user profile image
          let thumbnailUrl = null;
          if (res.includes?.media && res.includes.media.length > 0) {
            // Use the first media item (usually the main image)
            const media = res.includes.media[0];
            if (media.type === "photo") {
              thumbnailUrl = media.url;
            }
          } else if (user?.profile_image_url) {
            // Fallback to user's profile image (replace '_normal' with higher quality)
            thumbnailUrl = user.profile_image_url.replace(
              "_normal",
              "_400x400"
            );
          }

          metadata = {
            username: user?.username || null,
            posted_at: res.data?.created_at || null,
            thumbnail_url: thumbnailUrl,
            views: Number(metrics.impression_count || 0),
            likes: Number(metrics.like_count || 0),
            comments: Number(metrics.reply_count || 0),
            shares:
              Number(metrics.retweet_count || 0) +
              Number(metrics.quote_count || 0),
          };
        }
      } else if (platform === "instagram") {
        const token = process.env.APIFY_API_TOKEN;
        const session = process.env.INSTAGRAM_SESSION_ID;
        if (token && session) {
          console.log("Starting Instagram scraping for:", postUrl);

          const run = await fetch(
            `https://api.apify.com/v2/acts/apify~instagram-scraper/runs?token=${token}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                directUrls: [postUrl],
                resultsLimit: 1,
                sessionConfig: {
                  sessionCookies: [{ name: "sessionid", value: session }],
                },
              }),
            }
          );
          const runData = await run.json();
          const runId = runData.data?.id;

          if (runId) {
            console.log("Instagram run started, ID:", runId);

            // Wait for the run to complete (poll for up to 30 seconds)
            let attempts = 0;
            let runStatus = "RUNNING";

            while (attempts < 30 && runStatus === "RUNNING") {
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

              const statusRes = await fetch(
                `https://api.apify.com/v2/acts/apify~instagram-scraper/runs/${runId}?token=${token}`
              );
              const statusData = await statusRes.json();
              runStatus = statusData.data?.status;
              attempts++;

              console.log(
                `Instagram run status: ${runStatus} (attempt ${attempts})`
              );
            }

            if (runStatus === "SUCCEEDED") {
              const datasetId = runData.data?.defaultDatasetId;
              if (datasetId) {
                const itemsRes = await fetch(
                  `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`
                );
                const items = await itemsRes.json();
                const item = items?.[0];

                if (item) {
                  console.log("Instagram data fetched:", item);
                  metadata = {
                    thumbnail_url: item.displayUrl || item.thumbnailUrl || null,
                    username: item.ownerUsername || item.username || null,
                    posted_at: item.timestamp || item.postedAt || null,
                    views: Number(
                      item.playCount || item.videoViewCount || item.views || 0
                    ),
                    likes: Number(item.likesCount || item.likes || 0),
                    comments: Number(item.commentsCount || item.comments || 0),
                  };
                  console.log("Instagram metadata prepared:", metadata);
                } else {
                  console.warn("No Instagram data found in dataset");
                }
              }
            } else {
              console.warn(
                `Instagram scraping failed with status: ${runStatus}`
              );
            }
          } else {
            console.warn("Failed to start Instagram scraping run");
          }
        } else {
          console.warn("APIFY_API_TOKEN or INSTAGRAM_SESSION_ID not set");
        }
>>>>>>> fbb20c6 (Track Post and Share Campaign)
      }
      throw insertError;
    }

<<<<<<< HEAD
    // 5. Send the newly created post back to the frontend
    return NextResponse.json(newPost, { status: 200 });

  } catch (error: any) {
    console.error('Error adding post:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
=======
    // Use UPSERT to handle duplicate URLs (update existing, insert new)
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          campaign_id: campaignId,
          post_url: postUrl,
          platform: platform, // Use database enum format (lowercase)
          ...metadata,
        },
      ]),
    });

    if (!resp.ok) {
      return new NextResponse(
        JSON.stringify({ error: `Insert failed: ${await resp.text()}` }),
        { status: resp.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    return new NextResponse(JSON.stringify({ post: data?.[0] ?? null }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
>>>>>>> fbb20c6 (Track Post and Share Campaign)
  }
}