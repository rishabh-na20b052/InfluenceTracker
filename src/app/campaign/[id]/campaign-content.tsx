import DashboardClient from "@/components/dashboard/dashboard-client";
import type { Post } from "@/lib/types";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface CampaignContentProps {
  id: string;
  shareId?: string;
  isReadOnly: boolean;
  baseUrl: string;
}

export default async function CampaignContent({
  id,
  shareId,
  isReadOnly,
  baseUrl,
}: CampaignContentProps) {
  // Validate share link if in readonly mode with share ID
  if (shareId && typeof shareId === "string") {
    const shareValidation = await fetch(
      `${baseUrl}/api/campaigns/share/validate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareId, campaignId: id }),
        cache: "no-store",
      }
    );

    if (!shareValidation.ok) {
      // Share link is invalid or expired
      const errorData = await shareValidation.json();
      return (
        <div className="min-h-screen w-full bg-background flex items-center justify-center">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-4">Link Expired or Invalid</h1>
            <p className="text-muted-foreground mb-6">
              {errorData.error || "This share link is no longer valid."}
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact the campaign owner for a new share link.
            </p>
          </div>
        </div>
      );
    }
  }

  try {
    // Use Supabase client directly instead of API calls
    const supabase = await createClient();

    let campaignResult, postsResult;

    if (isReadOnly) {
      // For readonly mode, fetch campaign data without user authentication
      // We'll use the service role key to bypass RLS for shared campaigns
      const SUPABASE_URL =
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const SERVICE_ROLE_KEY =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_SERVICE_KEY;

      if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
        throw new Error("Supabase configuration missing");
      }

      // Fetch campaign data using service role (bypasses RLS)
      const campaignResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/campaigns?id=eq.${encodeURIComponent(id)}`,
        {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
          cache: "no-store",
        }
      );

      const postsResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/posts?campaign_id=eq.${encodeURIComponent(
          id
        )}&order=created_at.desc`,
        {
          headers: {
            apikey: SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          },
          cache: "no-store",
        }
      );

      if (!campaignResponse.ok || !postsResponse.ok) {
        notFound();
      }

      const campaignData = await campaignResponse.json();
      const postsData = await postsResponse.json();

      if (!campaignData || campaignData.length === 0) {
        notFound();
      }

      campaignResult = { data: campaignData[0], error: null };
      postsResult = { data: postsData, error: null };
    } else {
      // For authenticated users, get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        notFound();
      }

      // Fetch campaign and posts data directly from Supabase (company-wide access)
      const [campaignRes, postsRes] = await Promise.all([
        supabase.from("campaigns").select("*").eq("id", id).single(),
        supabase
          .from("posts")
          .select("*")
          .eq("campaign_id", id)
          .order("created_at", { ascending: false }),
      ]);

      campaignResult = campaignRes;
      postsResult = postsRes;
    }

    if (campaignResult.error || !campaignResult.data) {
      notFound();
    }

    const cData = campaignResult.data;
    const pData = { posts: postsResult.data || [] };

    // Validate campaign data structure
    if (!cData || !cData.name) {
      console.error("Invalid campaign data structure:", cData);
      notFound();
    }

    // Map database posts to frontend Post type
    const campaignPosts: Post[] = (pData.posts || []).map((p: any) => ({
      id: p.id,
      campaignId: p.campaign_id,
      url: p.post_url,
      platform:
        p.platform === "youtube"
          ? "YouTube"
          : p.platform === "instagram"
          ? "Instagram"
          : "Twitter",
      influencer: p.username || "Unknown",
      influencerHandle: p.username ? `@${p.username}` : "@unknown",
      thumbnailUrl: p.thumbnail_url || "/assets/campaign_dp1.webp",
      date: p.posted_at || p.created_at,
      engagement: {
        likes: Number(p.likes || 0),
        comments: Number(p.comments || 0),
        views: Number(p.views || 0),
        retweets: Number(p.shares || 0),
      },
    }));

    return (
      <DashboardClient
        initialPosts={campaignPosts}
        campaignName={cData.name}
        campaignId={id}
        isReadOnly={isReadOnly}
      />
    );
  } catch (error) {
    console.error("Error loading campaign:", error);
    notFound();
  }
}
