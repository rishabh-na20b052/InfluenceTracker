// app/api/posts/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/supabase'; // Assuming you have Supabase types generated

// Helper to determine platform from URL
function getPlatformFromUrl(url: string): 'instagram' | 'youtube' | 'x' | 'unknown' {
    if (url.match(/instagram\.com\/(p|reel)\//)) return 'instagram';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('x.com') || url.includes('twitter.com')) return 'x';
    return 'unknown';
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
      }
      throw insertError;
    }

    // 5. Send the newly created post back to the frontend
    return NextResponse.json(newPost, { status: 200 });

  } catch (error: any) {
    console.error('Error adding post:', error);
    return NextResponse.json({ error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}