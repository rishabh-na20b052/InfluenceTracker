import DashboardClient from '@/components/dashboard/dashboard-client';
import { campaigns, mockPosts } from '@/lib/data';
import type { Post } from '@/lib/types';
import { notFound } from 'next/navigation';

export default async function CampaignDashboardPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    notFound();
  }

  const campaignPosts: Post[] = mockPosts.filter(p => campaign.postIds.includes(p.id));

  const isReadOnly = resolvedSearchParams.view === 'readonly';

  return <DashboardClient initialPosts={campaignPosts} campaignName={campaign.name} campaignId={id} isReadOnly={isReadOnly} />;
}
