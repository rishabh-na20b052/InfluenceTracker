import DashboardClient from '@/components/dashboard/dashboard-client';
import { campaigns, mockPosts } from '@/lib/data';
import type { Post } from '@/lib/types';
import { notFound } from 'next/navigation';

export default async function CampaignDashboardPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
<<<<<<< HEAD
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
=======
  const shareId = resolvedSearchParams.share;

  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host");
  if (!host) notFound();
  const baseUrl = `${proto}://${host}`;

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

  const [cRes, pRes] = await Promise.all([
    fetch(`${baseUrl}/api/campaigns/${id}`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/campaigns/${id}/posts`, { cache: "no-store" }),
  ]);

  const cData = await cRes.json();
  if (!cRes.ok) {
>>>>>>> fbb20c6 (Track Post and Share Campaign)
    notFound();
  }

  const campaignPosts: Post[] = mockPosts.filter(p => campaign.postIds.includes(p.id));

<<<<<<< HEAD
  const isReadOnly = resolvedSearchParams.view === 'readonly';
=======
  const campaignPosts: Post[] = (pData.posts || []).map((p: any) => ({
    id: p.id,
    campaignId: p.campaign_id,
    url: p.post_url,
    platform:
      p.platform === "youtube"
        ? "YouTube"
        : p.platform === "instagram"
        ? "Instagram"
        : p.platform === "x"
        ? "Twitter"
        : "YouTube", // Map database enum to UI format
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
>>>>>>> fbb20c6 (Track Post and Share Campaign)

  return <DashboardClient initialPosts={campaignPosts} campaignName={campaign.name} campaignId={id} isReadOnly={isReadOnly} />;
}
