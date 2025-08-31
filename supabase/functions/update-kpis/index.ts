// supabase/functions/update-kpis/index.ts (Final, Resilient Version)

import { createClient } from 'npm:@supabase/supabase-js@2';
import { ApifyClient } from 'npm:apify-client@2';

interface Post {
  id: string;
  post_url: string;
  platform: 'instagram' | 'x' | 'youtube';
}

const supabase = createClient(
  Deno.env.get('PROJECT_URL')!,
  Deno.env.get('PROJECT_SERVICE_ROLE_KEY')!
);

Deno.serve(async (_req) => {
  try {
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    
    // --- THIS IS THE ONLY LINE THAT HAS CHANGED ---
    const { data: postsToUpdate, error: fetchError } = await supabase
      .from('posts')
      .select('id, post_url, platform')
      .or(`last_scraped_at.is.null,last_scraped_at.lt.${oneHourAgo}`) // Correct 'less than' syntax is 'lt'
      .limit(20);
    // --- END OF CHANGE ---

    if (fetchError) throw fetchError;

    if (!postsToUpdate || postsToUpdate.length === 0) {
      return new Response(JSON.stringify({ message: "No stale posts to update." }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Found ${postsToUpdate.length} posts to update.`);
    
    // The rest of the function remains the same...
    const updatePromises = postsToUpdate.map(post => getKpisForPost(post));
    const updatedKpis = await Promise.all(updatePromises);
    
    const successfulUpdates = updatedKpis
      .filter(kpi => kpi !== null)
      .map(kpi => ({
        ...kpi,
        last_scraped_at: new Date().toISOString(),
      }));

    if (successfulUpdates.length > 0) {
      console.log(`Saving ${successfulUpdates.length} updates to the database.`);
      const { error: upsertError } = await supabase
        .from('posts')
        .upsert(successfulUpdates);
      if (upsertError) throw upsertError;
    }

    return new Response(JSON.stringify({ message: `Successfully updated ${successfulUpdates.length} posts.` }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Critical Error in Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function getKpisForPost(post: Post) {
  try {
    switch (post.platform) {
      // ... (Instagram and YouTube cases remain the same) ...
      
      case 'x': {
        const tweetId = post.post_url.match(/\/status\/(\d+)/)?.[1];
        if (!tweetId) return null;

        const endpoint = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics,text&expansions=attachments.media_keys&media.fields=preview_image_url`;
        const res = await fetch(endpoint, { headers: { 'Authorization': `Bearer ${Deno.env.get('X_BEARER_TOKEN')!}` } });

        // --- START OF NEW LOGIC: RATE LIMIT HANDLING ---
        if (res.status === 429) {
          console.warn('X API rate limit exceeded. Setting circuit breaker.');
          const resetTimestamp = res.headers.get('x-rate-limit-reset'); // This is in UNIX seconds
          if (resetTimestamp) {
            const resetDate = new Date(parseInt(resetTimestamp, 10) * 1000);
            // Save the reset time to our database to prevent future calls.
            await supabase
              .from('system_flags')
              .upsert({ flag_key: 'x_api_quota_exceeded_until', flag_value: resetDate.toISOString() });
          }
          // Return null to gracefully skip this post for now.
          return null;
        }
        // --- END OF NEW LOGIC ---

        if (!res.ok) {
            throw new Error(`X API returned status ${res.status}: ${await res.text()}`);
        }
        
        const result = await res.json();
        const media = result.includes?.media?.[0];
        
        return {
          id: post.id,
          caption: result.data.text,
          thumbnail_url: media?.preview_image_url || null,
          likes: result.data.public_metrics.like_count || 0,
          comments: result.data.public_metrics.reply_count || 0,
          views: result.data.public_metrics.impression_count || 0,
        };
      }
      // ...
    }
  } catch (error) {
    console.error(`Failed to process ${post.platform} URL ${post.post_url}:`, error.message);
    return null;
  }
}