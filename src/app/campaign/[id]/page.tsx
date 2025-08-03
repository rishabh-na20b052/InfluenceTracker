import DashboardClient from '@/components/dashboard/dashboard-client';
import { campaigns, mockPosts } from '@/lib/data';
import type { Post } from '@/lib/types';
import { notFound } from 'next/navigation';

export default function CampaignDashboardPage({ params }: { params: { id: string } }) {
  const campaign = campaigns.find((c) => c.id === params.id);

  if (!campaign) {
    notFound();
  }

  const campaignPosts: Post[] = mockPosts.filter(p => campaign.postIds.includes(p.id));

  return <DashboardClient initialPosts={campaignPosts} campaignName={campaign.name} />;
}
