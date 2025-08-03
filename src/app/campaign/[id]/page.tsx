import DashboardClient from '@/components/dashboard/dashboard-client';
import { campaigns, mockPosts } from '@/lib/data';
import type { Post } from '@/lib/types';
import { notFound } from 'next/navigation';

export default function CampaignDashboardPage({ params, searchParams }: { params: { id: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
  const campaign = campaigns.find((c) => c.id === params.id);

  if (!campaign) {
    notFound();
  }

  const campaignPosts: Post[] = mockPosts.filter(p => campaign.postIds.includes(p.id));

  const isReadOnly = searchParams.view === 'readonly';

  return <DashboardClient initialPosts={campaignPosts} campaignName={campaign.name} campaignId={campaign.id} isReadOnly={isReadOnly} />;
}
