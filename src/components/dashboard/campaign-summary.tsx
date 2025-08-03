'use client';

import type { Post } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, MessageCircle } from 'lucide-react';

type CampaignSummaryProps = {
  posts: Post[];
  campaignName: string;
};

export default function CampaignSummary({ posts, campaignName }: CampaignSummaryProps) {
  const totalPosts = posts.length;
  const { totalLikes, totalComments } = posts.reduce(
    (acc, post) => {
      acc.totalLikes += post.engagement.likes;
      acc.totalComments += post.engagement.comments;
      return acc;
    },
    { totalLikes: 0, totalComments: 0 }
  );

  const uniqueInfluencers = new Set(posts.map(p => p.influencer)).size;

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        {campaignName}: Snapshot
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">Tracked across all platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cumulative likes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cumulative comments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Influencers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueInfluencers}</div>
            <p className="text-xs text-muted-foreground">Unique influencers in campaign</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
